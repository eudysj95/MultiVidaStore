"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;
  const payment = (searchParams.get("payment") as string) || "bolivares";
  const supabase = createClient();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !categoryId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, name").eq("id", categoryId).single(),
        supabase
          .from("products")
          .select("id, name, price_bs, price_usd, price_cashea, image_url")
          .eq("category_id", categoryId)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (catRes.error) {
        setError(catRes.error.message);
        setLoading(false);
        return;
      }

      setCategory(catRes.data);
      setProducts((prodRes.data as unknown as DbProduct[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [supabase, categoryId]);

  const getPrice = (product: DbProduct): number => {
    if (payment === "dolar") return Number(product.price_usd ?? product.price_bs);
    if (payment === "cashea") return Number(product.price_cashea ?? product.price_bs);
    return Number(product.price_bs);
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={getPrice(product)}
                image={product.image_url || "/images/categories/cafeteras.png"}
                currency={payment as Currency}
                href="#/"
              />
            ))}
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
