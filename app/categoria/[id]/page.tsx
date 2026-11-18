"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandSwitch from "@/components/BrandSwitch";
import ProductCard, { type Currency } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

interface DbProduct {
  id: string;
  name: string;
  price_bs: number;
  price_usd: number | null;
  price_cashea: number | null;
  image_url: string | null;
}

const PAGE_SIZE = 24;

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const payment = (searchParams.get("payment") as string) || "bolivares";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const supabase = createClient();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !categoryId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, name").eq("id", categoryId).single(),
        supabase
          .from("products")
          .select("id, name, price_bs, price_usd, price_cashea, image_url", {
            count: "exact",
          })
          .eq("category_id", categoryId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .range(from, to),
      ]);

      if (catRes.error) {
        setError(catRes.error.message);
        setLoading(false);
        return;
      }

      setCategory(catRes.data);
      setProducts((prodRes.data as unknown as DbProduct[]) || []);
      setTotal(prodRes.count ?? 0);
      setLoading(false);
    };

    fetchData();
  }, [supabase, categoryId, page]);

  const getPrice = (product: DbProduct): number => {
    if (payment === "dolar") return Number(product.price_usd ?? product.price_bs);
    if (payment === "cashea") return Number(product.price_cashea ?? product.price_bs);
    return Number(product.price_bs);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (next: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (next <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(next));
    }
    const query = nextParams.toString();
    router.push(`/categoria/${categoryId}${query ? `?${query}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-brand-blue hover:text-brand-blue/80 transition-colors"
        >
          ← Volver al inicio
        </Link>
        <BrandSwitch />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <h1 className="text-2xl font-bold text-brand-black mb-6">
          {loading ? "Cargando..." : category?.name || "Categoría"}
        </h1>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Cargando productos...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={getPrice(product)}
                  image={product.image_url || "/images/categories/cafeteras.png"}
                  currency={payment as Currency}
                  href={`/producto/${product.id}`}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8">
              <p className="text-sm text-gray-600">
                Página {page} de {totalPages} · {total} productos
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        ) : total > 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No hay productos en esta página.</p>
            <button
              onClick={() => goToPage(1)}
              className="mt-2 text-brand-blue font-medium"
            >
              Volver a la primera página
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No hay productos en esta categoría todavía.
          </div>
        )}
      </main>
    </div>
  );
}
