"use client";

import { useSearchParams } from "next/navigation";
import BrandSwitch from "@/components/BrandSwitch";
import HeroBanner from "@/components/HeroBanner";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  { name: "Móviles", image: "/images/categories/mobiles.png" },
  { name: "Laptops", image: "/images/categories/laptops.png" },
  { name: "Audífonos", image: "/images/categories/headphones.png" },
  { name: "Monitores y TVs", image: "/images/categories/monitors.png" },
  { name: "Parlantes", image: "/images/categories/speakers.png" },
];

const POPULAR_PRODUCTS = [
  {
    id: "1",
    name: "Funda magnética",
    price: 13.49,
    oldPrice: 18.99,
    image: "/images/products/magnetic-case.png",
    rating: 5,
  },
  {
    id: "2",
    name: "UCOMX Nano 3 en 1",
    price: 39.99,
    oldPrice: 49.99,
    image: "/images/products/ucomx-nano.png",
    rating: 5,
  },
  {
    id: "3",
    name: "NB Fresh Foam",
    price: 71.99,
    oldPrice: 89.99,
    image: "/images/products/nb-fresh-foam.png",
    rating: 4,
  },
  {
    id: "4",
    name: "Bose QuietComfort",
    price: 379.00,
    oldPrice: 429.00,
    image: "/images/products/bose-quietcomfort.png",
    rating: 5,
  },
  {
    id: "5",
    name: "Bocina BUGANI BT",
    price: 59.93,
    oldPrice: 79.08,
    image: "/images/products/bugani-speaker.png",
    rating: 4,
  },
  {
    id: "6",
    name: "Galaxy Tab A9+",
    price: 169.99,
    oldPrice: 209.00,
    image: "/images/products/galaxy-tab.png",
    rating: 5,
  },
  {
    id: "7",
    name: "Acer Aspire 1",
    price: 228.27,
    oldPrice: 269.00,
    image: "/images/products/acer-aspire.png",
    rating: 4,
  },
  {
    id: "8",
    name: "Redragon M810",
    price: 32.99,
    oldPrice: 49.99,
    image: "/images/products/redragon-m810.png",
    rating: 5,
  },
];

export default function Home() {
  const searchParams = useSearchParams();
  const payment = (searchParams.get("payment") as string) || "bolivares";

  const paymentLabels: Record<string, string> = {
    bolivares: "Bs.",
    dolar: "USD",
    cashea: "Cashea",
  };

  return (
    <div className="min-h-screen bg-white">
      <BrandSwitch />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <HeroBanner />
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-black">Categorías destacadas</h2>
            <a href="#" className="text-sm font-medium text-brand-blue">
              Ver más →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.name} {...cat} href="#/" />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-black">Productos populares</h2>
            <a href="#" className="text-sm font-medium text-brand-blue">
              Ver más →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {POPULAR_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} href="#/" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
