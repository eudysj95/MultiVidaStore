"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  product_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setError("Supabase no configurado");
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, product_count")
        .order("name", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setCategories(data || []);
      setLoading(false);
    };

    fetchCategories();
  }, [supabase]);

  const header = (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-black">Categorías</h1>
        <p className="text-gray-600">Gestiona las categorías de productos</p>
      </div>
      <Link
        href="#"
        className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
      >
        + Nueva categoría
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {header}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 text-center text-gray-500">Cargando categorías...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {header}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {header}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Productos</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 font-medium text-brand-black">{cat.name}</td>
                <td className="px-6 py-4 text-right text-gray-700 font-medium">
                  {cat.product_count}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2">
                    <Link
                      href="#"
                      className="text-brand-blue hover:text-brand-blue/90 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p>No hay categorías todavía.</p>
        </div>
      )}
    </div>
  );
}
