"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price_bs: number;
  price_usd: number;
  price_cashea: number;
  category: string;
  image_url: string;
  created_at: string;
}

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Por ahora usamos datos de ejemplo hasta que conectemos el backend
    setProducts([
      {
        id: "1",
        name: "Funda magnética",
        price_bs: 13.49,
        price_usd: 39.99,
        price_cashea: 39.99,
        category: "Accesorios",
        image_url: "/images/products/magnetic-case.png",
        created_at: "2026-11-01",
      },
      {
        id: "2",
        name: "UCOMX Nano 3 en 1",
        price_bs: 39.99,
        price_usd: 49.99,
        price_cashea: 49.99,
        category: "Accesorios",
        image_url: "/images/products/ucomx-nano.png",
        created_at: "2026-11-01",
      },
      {
        id: "3",
        name: "Bose QuietComfort",
        price_bs: 379.00,
        price_usd: 429.00,
        price_cashea: 429.00,
        category: "Audio",
        image_url: "/images/products/bose-quietcomfort.png",
        created_at: "2026-11-02",
      },
    ]);
    setLoading(false);

    // TODO: Conectar a Supabase cuando el backend esté listo
    // const { data, error } = await supabase.from("products").select("*");
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Productos</h1>
          <p className="text-gray-600">Gestiona el catálogo de productos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Bs.</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">USD</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Cashea</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-medium text-brand-black">{product.name}</p>
                      <p className="text-xs text-gray-500">#{product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-brand-black">
                    Bs. {product.price_bs.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-gray-700">
                    ${product.price_usd.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-gray-700">
                    ${product.price_cashea.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-brand-blue hover:text-brand-blue/90 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`
                          )
                        ) {
                          // TODO: Implementar eliminación
                          alert("Función de eliminación pendiente de backend");
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p>No hay productos todavía.</p>
        </div>
      )}
    </div>
  );
}
