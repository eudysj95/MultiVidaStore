"use client";

import { createClient } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CurrencyPrices {
  bs: string;
  usd: string;
  cashea: string;
}

export default function NewProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    prices: {
      bs: "",
      usd: "",
      cashea: "",
    },
    image_url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (
    currency: keyof CurrencyPrices,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      prices: { ...prev.prices, [currency]: e.target.value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación básica
    if (!form.name || !form.category || !form.image_url) {
      setError("Nombre, categoría e imagen son obligatorios");
      setLoading(false);
      return;
    }

    // TODO: Conectar a Supabase cuando el backend esté listo
    // const { data, error } = await supabase.from("products").insert([{
    //   name: form.name,
    //   category: form.category,
    //   price_bs: parseFloat(form.prices.bs) || 0,
    //   price_usd: parseFloat(form.prices.usd) || 0,
    //   price_cashea: parseFloat(form.prices.cashea) || 0,
    //   image_url: form.image_url,
    // }]);

    // Por ahora simulamos éxito
    setTimeout(() => {
      setLoading(false);
      router.push("/admin/products");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Nuevo producto</h1>
        <p className="text-gray-600">Agrega un producto al catálogo</p>
      </div>

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
              Categoría
            </label>
            <select
              name="category"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Seleccionar categoría</option>
              <option value="Cafeteras">Cafeteras</option>
              <option value="Cocinas">Cocinas</option>
              <option value="Lavadoras">Lavadoras</option>
              <option value="Licuadoras">Licuadoras</option>
              <option value="Neveras">Neveras</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precios
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Ingresa los precios para cada forma de pago
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Bolívares (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  onChange={(e) => handlePriceChange("bs", e)}
                  value={form.prices.bs}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Dólar (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  onChange={(e) => handlePriceChange("usd", e)}
                  value={form.prices.usd}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Cashea
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  onChange={(e) => handlePriceChange("cashea", e)}
                  value={form.prices.cashea}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="url"
              name="image_url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Por ahora usa una URL directa. Después conectaremos a Supabase Storage.
            </p>
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
              {loading ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
