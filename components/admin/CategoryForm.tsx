"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export interface CategoryFormValues {
  id?: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: CategoryFormValues | null;
}

export default function CategoryForm({ mode, initial }: CategoryFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    icon_url: initial?.icon_url ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase no configurado");
      return;
    }

    if (!form.name.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon_url: form.icon_url.trim() || null,
    };

    const result =
      mode === "create"
        ? await supabase
            .from("categories")
            .insert({ ...payload, product_count: 0 })
        : await supabase.from("categories").update(payload).eq("id", initial?.id);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/categories");
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
            Nombre de la categoría
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Neveras"
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
            placeholder="Descripción breve de la categoría (opcional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icono / imagen
          </label>
          <input
            type="text"
            name="icon_url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
            value={form.icon_url}
            onChange={handleChange}
            placeholder="Ej: neveras.png o https://ejemplo.com/icono.png"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si es un nombre de archivo, se busca en{" "}
            <code className="font-mono">/images/categories/</code>. También podés
            pegar una URL completa.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
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
                ? "Guardar categoría"
                : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
