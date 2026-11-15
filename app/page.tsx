"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
          .limit(8),
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

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-black">Categorías destacadas</h2>
            <a href="#" className="text-sm font-medium text-brand-blue">
              Ver más →
            </a>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando categorías...</div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No hay categorías todavía.</div>
          )}
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-black">Productos populares</h2>
            <a href="#" className="text-sm font-medium text-brand-blue">
              Ver más →
            </a>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando productos...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
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
            <div className="text-center text-gray-500 py-8">No hay productos todavía.</div>
          )}
        </section>
      </main>
    </div>
  );
}
