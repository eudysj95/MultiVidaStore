"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues {
  id?: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price_bs: number;
  price_usd: number | null;
  price_cashea: number | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
}

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: ProductFormValues | null;
}

export default function ProductForm({ mode, initial }: ProductFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category_id: initial?.category_id ?? "",
    price_bs: initial?.price_bs != null ? String(initial.price_bs) : "",
    price_usd: initial?.price_usd != null ? String(initial.price_usd) : "",
    price_cashea: initial?.price_cashea != null ? String(initial.price_cashea) : "",
    image_url: initial?.image_url ?? "",
    stock: initial?.stock != null ? String(initial.stock) : "0",
    is_active: initial?.is_active ?? true,
  });

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }: { data: Category[] | null }) => {
        if (data) setCategories(data);
      });
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG o WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB");
      return;
    }

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError("Error al subir la imagen: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase no configurado");
      return;
    }

    if (!form.name.trim() || !form.category_id || form.price_bs === "") {
      setError("Nombre, categoría y precio en Bs. son obligatorios");
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id,
      price_bs: parseFloat(form.price_bs) || 0,
      price_usd: form.price_usd ? parseFloat(form.price_usd) : null,
      price_cashea: form.price_cashea ? parseFloat(form.price_cashea) : null,
      image_url: form.image_url.trim() || null,
      stock: parseInt(form.stock, 10) || 0,
      is_active: form.is_active,
    };

    const result =
      mode === "create"
        ? await supabase.from("products").insert(payload)
        : await supabase.from("products").update(payload).eq("id", initial?.id);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del producto
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Nevera Samsung 300L"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción breve del producto (opcional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            name="category_id"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
            value={form.category_id}
            onChange={handleChange}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precios
          </label>
          <p className="text-xs text-gray-500 mb-3">
            El precio en Bolívares es obligatorio. Los demás son opcionales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Bolívares (Bs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price_bs"
                required
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                onChange={handleChange}
                value={form.price_bs}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Dólar (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price_usd"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                onChange={handleChange}
                value={form.price_usd}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Cashea
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price_cashea"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                onChange={handleChange}
                value={form.price_cashea}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-blue"
              />
              <span className="text-sm font-medium text-gray-700">
                Producto activo (visible en la tienda)
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen del producto
          </label>

          <div className="flex items-start gap-4">
            {form.image_url ? (
              <img
                src={form.image_url}
                alt="Vista previa"
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-gray-50"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400 text-center px-2">
                Sin imagen
              </div>
            )}

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                {uploading
                  ? "Subiendo imagen..."
                  : "JPG, PNG o WebP. Máximo 5MB. Se sube a Supabase Storage."}
              </p>
            </div>
          </div>

          <input
            type="url"
            name="image_url"
            className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
            value={form.image_url}
            onChange={handleChange}
            placeholder="O pegá una URL directa: https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Guardando..."
              : mode === "create"
                ? "Guardar producto"
                : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
