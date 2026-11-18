"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandSwitch from "@/components/BrandSwitch";
import ProductCard, { type Currency } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase";

interface DbProduct {
  id: string;
  name: string;
  price_bs: number;
  price_usd: number | null;
  price_cashea: number | null;
  image_url: string | null;
  category: { name: string } | null;
}

const PAGE_SIZE = 24;

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const payment = (searchParams.get("payment") as string) || "bolivares";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const supabase = createClient();

  const [input, setInput] = useState(query);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // PostgREST usa comas y paréntesis como sintaxis del filtro `or`;
    // los quitamos para no romper la query con input del usuario.
    const safeQuery = query.replace(/[,()*%]/g, " ").trim();

    let cancelled = false;
    setLoading(true);

    const fetchProducts = async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let request = supabase
        .from("products")
        .select(
          "id, name, price_bs, price_usd, price_cashea, image_url, category:categories(name)",
          { count: "exact" }
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (safeQuery) {
        request = request.or(
          `name.ilike.*${safeQuery}*,description.ilike.*${safeQuery}*`
        );
      }

      const { data, count } = await request;

      if (!cancelled) {
        setProducts((data as unknown as DbProduct[]) || []);
        setTotal(count ?? 0);
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [supabase, query, page]);

  const getPrice = (product: DbProduct): number => {
    if (payment === "dolar")
      return Number(product.price_usd ?? product.price_bs);
    if (payment === "cashea")
      return Number(product.price_cashea ?? product.price_bs);
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
    const queryString = nextParams.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const value = input.trim();
    if (value) params.set("q", value);
    if (payment) params.set("payment", payment);
    router.push(`/buscar?${params.toString()}`);
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
        <form onSubmit={handleSubmit} className="max-w-xl flex gap-2 mb-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="search"
            placeholder="Buscar productos..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-brand-blue text-white font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Buscar
          </button>
        </form>

        <h1 className="text-2xl font-bold text-brand-black mb-6">
          {query ? `Resultados para "${query}"` : "Todos los productos"}
        </h1>

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Cargando productos...
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
            <p>No hay resultados en esta página.</p>
            <button
              onClick={() => goToPage(1)}
              className="mt-2 text-brand-blue font-medium"
            >
              Volver a la primera página
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            {query
              ? `No se encontraron productos para "${query}".`
              : "No hay productos todavía."}
          </div>
        )}
      </main>
    </div>
  );
}
