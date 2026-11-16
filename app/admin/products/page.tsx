"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price_bs: number;
  price_usd: number | null;
  price_cashea: number | null;
  category: { name: string } | null;
  image_url: string | null;
  created_at: string;
}

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase no configurado");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price_bs, price_usd, price_cashea, image_url, created_at, category:categories(name)")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setProducts((data as unknown as Product[]) || []);
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  const handleDelete = async (product: Product) => {
    if (!supabase) return;
    if (
      !window.confirm(
        `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Productos</h1>
            <p className="text-gray-600">Gestiona el catálogo de productos</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
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
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-brand-black">{product.name}</p>
                      <p className="text-xs text-gray-500">#{product.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {product.category?.name || "Sin categoría"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-brand-black">
                    Bs. {Number(product.price_bs).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-gray-700">
                    {product.price_usd != null ? `$${Number(product.price_usd).toFixed(2)}` : "—"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-gray-700">
                    {product.price_cashea != null ? `$${Number(product.price_cashea).toFixed(2)}` : "—"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/producto/${product.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-md border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-brand-blue hover:text-brand-blue/90 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
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
