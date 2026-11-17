"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandSwitch from "@/components/BrandSwitch";
import HeroBanner from "@/components/HeroBanner";
import CategoryCard from "@/components/CategoryCard";
import ProductCard, { type Currency } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  icon_url: string | null;
}

interface DbProduct {
  id: string;
  name: string;
  price_bs: number;
  price_usd: number | null;
  price_cashea: number | null;
  image_url: string | null;
  category: { name: string } | null;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payment = (searchParams.get("payment") as string) || "bolivares";
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, icon_url")
          .order("name", { ascending: true }),
        supabase
          .from("products")
          .select("id, name, price_bs, price_usd, price_cashea, image_url, category:categories(name)")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setProducts(prodRes.data as unknown as DbProduct[]);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const getPrice = (product: DbProduct): number => {
    if (payment === "dolar") return Number(product.price_usd ?? product.price_bs);
    if (payment === "cashea") return Number(product.price_cashea ?? product.price_bs);
    return Number(product.price_bs);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="flex justify-center pt-6">
        <BrandSwitch />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <HeroBanner />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = (
              e.currentTarget.elements.namedItem("q") as HTMLInputElement
            ).value.trim();
            const params = new URLSearchParams();
            if (value) params.set("q", value);
            if (payment) params.set("payment", payment);
            router.push(`/buscar?${params.toString()}`);
          }}
          className="mt-8 max-w-xl mx-auto flex gap-2"
        >
          <input
            name="q"
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

        <section className="mt-12 rounded-3xl bg-slate-100 p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-brand-black mb-6">Categorías</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando categorías...</div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, index) => {
                const isWide = index % 5 === 0;
                return (
                  <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    image={
                      cat.icon_url
                        ? cat.icon_url.startsWith("http")
                          ? cat.icon_url
                          : `/images/categories/${cat.icon_url}`
                        : "/images/categories/cafeteras.png"
                    }
                    href={`/categoria/${cat.id}`}
                    className={isWide ? "col-span-2" : ""}
                    imageClassName={isWide ? "aspect-[2/1]" : "aspect-square"}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No hay categorías todavía.</div>
          )}
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-brand-black">Productos populares</h2>
            <Link
              href="/buscar"
              className="shrink-0 px-4 py-2 rounded-lg border border-brand-blue text-brand-blue text-sm font-medium hover:bg-brand-blue hover:text-white transition-colors"
            >
              Ver todos los productos →
            </Link>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando productos...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
          ) : (
            <div className="text-center text-gray-500 py-8">No hay productos todavía.</div>
          )}
        </section>
      </main>
    </div>
  );
}
