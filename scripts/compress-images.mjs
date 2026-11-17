import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const inputDir = process.argv[2] ?? "./imagenes";
const outputDir = process.argv[3] ?? "./comprimidas";
const MAX_WIDTH = 1200;
const QUALITY = 80;

await mkdir(outputDir, { recursive: true });

const files = (await readdir(inputDir)).filter((file) =>
  /\.(jpe?g|png|webp|avif)$/i.test(file)
);

if (files.length === 0) {
  console.error(`No se encontraron imágenes en ${inputDir}`);
  process.exit(1);
}

let totalIn = 0;
let totalOut = 0;
let failed = 0;

for (const file of files) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

  try {
    const inputStat = await stat(inputPath);

    await sharp(inputPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const outputStat = await stat(outputPath);

    totalIn += inputStat.size;
    totalOut += outputStat.size;

    const saved = ((1 - outputStat.size / inputStat.size) * 100).toFixed(1);
    console.log(
      `✓ ${file} → ${path.basename(outputPath)} ` +
        `(${formatBytes(inputStat.size)} → ${formatBytes(outputStat.size)}, -${saved}%)`
    );
  } catch (error) {
    failed += 1;
    console.error(`✗ ${file}: ${error.message}`);
  }
}

console.log(
  `\nListo: ${files.length - failed}/${files.length} imágenes. ` +
    `${formatBytes(totalIn)} → ${formatBytes(totalOut)}.`
);

if (failed > 0) process.exitCode = 1;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
