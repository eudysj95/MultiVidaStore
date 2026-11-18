#!/usr/bin/env node
/**
 * Importador masivo de productos MultiVidaStore.
 *
 * Uso:
 *   pnpm import-products --csv ./productos.csv --images ./imagenes
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SECRET_KEY=sb_secret_...   (recomendado, server-only)
 *   o SUPABASE_SERVICE_ROLE_KEY=...     (legacy)
 *
 * Columnas del CSV (aliases en español/inglés):
 *   nombre, descripcion, precio_bs, precio_usd, precio_cashea,
 *   categoria, imagen, stock, activo
 *
 * La columna "imagen" debe tener el nombre del archivo dentro de --images.
 * Las imágenes se comprimen a WebP (máx 1200px, calidad 80) y se suben
 * al bucket "product-images" de Supabase Storage.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const BUCKET = "product-images";
const MAX_WIDTH = 1200;
const QUALITY = 80;

// ---------- CLI ----------

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const csvPath = args.csv;
const imagesDir = args.images;
const dryRun = Boolean(args["dry-run"]);
const createCategories = Boolean(args["create-categories"]);
const allowDuplicates = Boolean(args["allow-duplicates"]);
const delimiter = args.delimiter || null;
const bucket = args.bucket || BUCKET;

if (!csvPath) {
  console.error("Falta --csv <ruta>");
  printHelp();
  process.exit(1);
}
if (!imagesDir) {
  console.error("Falta --images <carpeta>");
  printHelp();
  process.exit(1);
}

// ---------- Env ----------

await loadEnvLocal();

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_URL en el entorno o en .env.local"
  );
  process.exit(1);
}

if (!serviceKey && !dryRun) {
  console.error(
    "Falta SUPABASE_SECRET_KEY (o la legacy SUPABASE_SERVICE_ROLE_KEY). Agregala a .env.local (solo local, nunca la commitees)."
  );
  process.exit(1);
}

const supabaseKey = serviceKey || anonKey;
if (!supabaseKey) {
  console.error(
    "Falta SUPABASE_SECRET_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY para --dry-run)."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------- CSV ----------

const csvText = stripBom(await readFile(csvPath, "utf8"));
const detectedDelimiter = delimiter || detectDelimiter(csvText);
const rows = parseCsv(csvText, detectedDelimiter);

if (rows.length < 2) {
  console.error("El CSV no tiene datos (se espera encabezado + filas).");
  process.exit(1);
}

const headers = rows[0].map(normalizeHeader);
const columnIndex = mapColumns(headers);
const missing = ["name", "price_bs", "category"].filter(
  (column) => columnIndex[column] == null
);
if (missing.length > 0) {
  console.error(
    `Faltan columnas obligatorias: ${missing.join(", ")}. ` +
      `Encabezados detectados: ${headers.join(", ")}`
  );
  process.exit(1);
}

// ---------- Categories ----------

const { data: categoryRows, error: categoriesError } = await supabase
  .from("categories")
  .select("id, name");

if (categoriesError) {
  console.error("Error leyendo categorías:", categoriesError.message);
  process.exit(1);
}

const categories = new Map(
  (categoryRows || []).map((category) => [
    normalizeKey(category.name),
    { id: category.id, name: category.name },
  ])
);

// ---------- Existing products (dedupe) ----------

const { data: existingRows, error: existingError } = await supabase
  .from("products")
  .select("id, name, category_id");

if (existingError) {
  console.error("Error leyendo productos existentes:", existingError.message);
  process.exit(1);
}

const existing = new Set(
  (existingRows || []).map((product) =>
    productKey(product.name, product.category_id)
  )
);

// ---------- Process ----------

const stats = {
  total: rows.length - 1,
  inserted: 0,
  skipped: 0,
  failed: 0,
  images: 0,
  warnings: 0,
};

const failures = [];
const imageCache = new Map();

console.log(
  `Importando ${stats.total} productos desde ${csvPath} ` +
    `(separador "${detectedDelimiter}", bucket "${bucket}")` +
    (dryRun ? " [DRY RUN]" : "")
);

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const line = i + 1;
  const name = cell(row, columnIndex.name);

  if (!name) {
    stats.skipped++;
    warn(line, "fila sin nombre, se omite");
    continue;
  }

  try {
    const categoryName = cell(row, columnIndex.category);
    if (!categoryName) {
      throw new Error("falta la categoría");
    }

    let category = categories.get(normalizeKey(categoryName));
    if (!category) {
      if (!createCategories) {
        throw new Error(
          `categoría "${categoryName}" no existe (usá --create-categories)`
        );
      }
      if (dryRun) {
        category = {
          id: `dry-${normalizeKey(categoryName)}`,
          name: categoryName,
        };
      } else {
        const { data: created, error: createError } = await supabase
          .from("categories")
          .insert({ name: categoryName.trim(), product_count: 0 })
          .select("id, name")
          .single();
        if (createError) {
          throw new Error(
            `no se pudo crear la categoría "${categoryName}": ${createError.message}`
          );
        }
        category = { id: created.id, name: created.name };
      }
      categories.set(normalizeKey(categoryName), category);
      console.log(`  + categoría creada: ${category.name}`);
    }

    const dedupeKey = productKey(name, category.id);
    if (!allowDuplicates && existing.has(dedupeKey)) {
      stats.skipped++;
      console.log(`[${i}/${stats.total}] - ${name} (ya existe)`);
      continue;
    }

    const priceBs = parsePrice(cell(row, columnIndex.price_bs));
    if (priceBs == null) {
      throw new Error("precio_bs inválido");
    }

    const imageName = cell(row, columnIndex.image);
    let imageUrl = null;

    if (imageName) {
      if (/^https?:\/\//i.test(imageName)) {
        imageUrl = imageName;
      } else {
        const imagePath = resolveImagePath(imagesDir, imageName);
        const imageStat = await stat(imagePath).catch(() => null);
        if (!imageStat) {
          stats.warnings++;
          warn(
            line,
            `no se encontró la imagen "${imageName}", se importa sin imagen`
          );
        } else if (dryRun) {
          imageUrl = `[dry-run] ${imageName}`;
        } else {
          imageUrl = await uploadImage(
            imagePath,
            imageName,
            name,
            category.name
          );
          stats.images++;
        }
      }
    }

    const payload = {
      name: name.trim(),
      description: cell(row, columnIndex.description)?.trim() || null,
      category_id: category.id,
      price_bs: priceBs,
      price_usd: parsePrice(cell(row, columnIndex.price_usd)),
      price_cashea: parsePrice(cell(row, columnIndex.price_cashea)),
      image_url: imageUrl,
      stock: parseStock(cell(row, columnIndex.stock)),
      is_active: parseBool(cell(row, columnIndex.is_active), true),
    };

    if (dryRun) {
      console.log(`[${i}/${stats.total}] ✓ ${payload.name} (dry-run)`);
      stats.inserted++;
      existing.add(dedupeKey);
      continue;
    }

    const { error: insertError } = await supabase
      .from("products")
      .insert(payload);

    if (insertError) {
      throw new Error(insertError.message);
    }

    stats.inserted++;
    existing.add(dedupeKey);
    console.log(`[${i}/${stats.total}] ✓ ${payload.name}`);
  } catch (error) {
    stats.failed++;
    failures.push({ line, name, message: error.message });
    console.error(`[${i}/${stats.total}] ✗ ${name}: ${error.message}`);
  }
}

// ---------- Summary ----------

console.log("\nResumen:");
console.log(`  Insertados: ${stats.inserted}`);
console.log(`  Omitidos:   ${stats.skipped}`);
console.log(`  Errores:    ${stats.failed}`);
console.log(`  Imágenes:   ${stats.images}`);
console.log(`  Avisos:     ${stats.warnings}`);

if (failures.length > 0) {
  console.log("\nErrores:");
  for (const failure of failures) {
    console.log(
      `  línea ${failure.line} (${failure.name}): ${failure.message}`
    );
  }
  process.exitCode = 1;
}

if (dryRun) {
  console.log("\nDry run: no se subió ni insertó nada.");
}

// ---------- Helpers ----------

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (
      key === "help" ||
      key === "dry-run" ||
      key === "create-categories" ||
      key === "allow-duplicates"
    ) {
      result[key] = true;
    } else {
      result[key] = argv[++i];
    }
  }
  return result;
}

function printHelp() {
  console.log(`
Uso:
  pnpm import-products --csv ./productos.csv --images ./imagenes

Opciones:
  --csv <ruta>          CSV con los productos (requerido)
  --images <ruta>       Carpeta con las imágenes locales (requerido)
  --dry-run             Valida sin subir ni insertar
  --create-categories   Crea categorías que no existan
  --allow-duplicates    No omite productos ya existentes
  --delimiter <char>    Separador del CSV (default: autodetectar , o ;)
  --bucket <nombre>     Bucket de Storage (default: product-images)
  --help                Muestra esta ayuda

Columnas del CSV (aliases en español/inglés):
  nombre, descripcion, precio_bs, precio_usd, precio_cashea,
  categoria, imagen, stock, activo

La columna "imagen" debe tener el nombre del archivo dentro de --images.
Las imágenes se comprimen a WebP (máx ${MAX_WIDTH}px, calidad ${QUALITY})
y se suben al bucket de Supabase Storage.`);
}

async function loadEnvLocal() {
  if (
    (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY) &&
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  ) {
    return;
  }
  try {
    const text = await readFile(".env.local", "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local es opcional si las variables ya están en el entorno.
  }
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function mapColumns(headers) {
  const aliases = {
    name: ["nombre", "name", "producto", "articulo"],
    description: ["descripcion", "description", "detalle"],
    price_bs: ["precio_bs", "price_bs", "precio_bolivares", "precio", "bs"],
    price_usd: ["precio_usd", "price_usd", "precio_dolar", "usd", "dolar"],
    price_cashea: ["precio_cashea", "price_cashea", "cashea"],
    category: ["categoria", "category", "rubro"],
    image: ["imagen", "image", "imagen_url", "foto", "archivo"],
    stock: ["stock", "cantidad", "existencia"],
    is_active: ["activo", "is_active", "activa", "estado"],
  };

  const index = {};
  for (const [key, names] of Object.entries(aliases)) {
    const found = headers.findIndex((header) => names.includes(header));
    if (found !== -1) index[key] = found;
  }
  return index;
}

function cell(row, index) {
  if (index == null) return "";
  return (row[index] ?? "").trim();
}

function normalizeKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function productKey(name, categoryId) {
  return `${normalizeKey(name)}|${categoryId}`;
}

function parsePrice(value) {
  if (value == null) return null;
  let text = String(value).trim();
  if (!text) return null;
  text = text.replace(/[^\d.,-]/g, "");
  if (!text) return null;

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");

  if (lastComma > lastDot) {
    if ((text.match(/,/g) || []).length > 1) {
      text = text.replace(/,/g, "");
    } else {
      text = text.replace(/\./g, "").replace(",", ".");
    }
  } else if (lastDot > lastComma) {
    if ((text.match(/\./g) || []).length > 1 && lastComma === -1) {
      text = text.replace(/\./g, "");
    } else {
      const afterDot = text.slice(lastDot + 1);
      if (/^\d{3}$/.test(afterDot) && text.indexOf(".") === lastDot) {
        text = text.replace(/\./g, "");
      } else {
        text = text.replace(/,/g, "");
      }
    }
  } else if (lastComma !== -1) {
    text = text.replace(",", ".");
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function parseStock(value) {
  const digits = String(value ?? "").replace(/[^\d-]/g, "");
  if (!digits) return 0;
  const number = parseInt(digits, 10);
  return Number.isFinite(number) ? number : 0;
}

function parseBool(value, fallback) {
  if (value == null || String(value).trim() === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "si", "sí", "yes", "y", "activo", "activa"].includes(
    normalized
  );
}

function resolveImagePath(imagesDir, imageName) {
  const root = path.resolve(imagesDir);
  const resolved = path.resolve(root, imageName);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`ruta de imagen fuera de la carpeta: ${imageName}`);
  }
  return resolved;
}

async function uploadImage(imagePath, imageName, productName, categoryName) {
  const cached = imageCache.get(imagePath);
  if (cached) return cached;

  const slug = slugify(productName) || "producto";
  const hash = crypto
    .createHash("sha1")
    .update(`${imageName}|${productName}|${categoryName}`)
    .digest("hex")
    .slice(0, 12);
  const storagePath = `products/${slug}-${hash}.webp`;

  const buffer = await sharp(imagePath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`error subiendo imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  imageCache.set(imagePath, data.publicUrl);
  return data.publicUrl;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function warn(line, message) {
  console.warn(`  ⚠ línea ${line}: ${message}`);
}
