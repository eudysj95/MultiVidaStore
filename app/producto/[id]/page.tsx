"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import BrandSwitch from "@/components/BrandSwitch";
import { createClient } from "@/lib/supabase";

type Currency = "bolivares" | "dolar" | "cashea";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  bolivares: "Bs.",
  dolar: "USD",
  cashea: "Cashea",
};

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_bs: number;
  price_usd: number | null;
  price_cashea: number | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  category: { id: string; name: string } | null;
}

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const payment = ((searchParams.get("payment") as Currency) ||
    "bolivares") as Currency;
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price_bs, price_usd, price_cashea, image_url, stock, is_active, category:categories(id, name)"
        )
        .eq("id", productId)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const raw = data as unknown as Product & {
        category:
          | { id: string; name: string }
          | { id: string; name: string }[]
          | null;
      };
      const category = Array.isArray(raw.category)
        ? raw.category[0] ?? null
        : raw.category;

      setProduct({ ...raw, category });
      setLoading(false);
    };

    fetchProduct();
  }, [supabase, productId]);

  const symbol = CURRENCY_SYMBOLS[payment] ?? "Bs.";
  const price = product
    ? payment === "dolar"
      ? Number(product.price_usd ?? product.price_bs)
      : payment === "cashea"
        ? Number(product.price_cashea ?? product.price_bs)
        : Number(product.price_bs)
    : 0;

  const imageSrc =
    product?.image_url &&
    (product.image_url.startsWith("https://") ||
      product.image_url.startsWith("/"))
      ? product.image_url
      : "/images/categories/cafeteras.png";

  // ⚠️ Reemplazá este número por el WhatsApp real del dueño
  const whatsappNumber = "584246187569";
  const [productLink, setProductLink] = useState("");

  useEffect(() => {
    setProductLink(window.location.href);
  }, []);

  const message = product
    ? `Hola, me interesa el producto "${product.name}" a ${symbol} ${price.toFixed(2)}. Link: ${productLink}`
    : "";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const backHref = product?.category
    ? `/categoria/${product.category.id}`
    : "/";
  const backLabel = product?.category
    ? `← Volver a ${product.category.name}`
    : "← Volver al inicio";

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={backHref}
          className="text-sm font-medium text-brand-blue hover:text-brand-blue/80 transition-colors"
        >
          {backLabel}
        </Link>
        <BrandSwitch />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Cargando producto...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : !product ? (
          <div className="text-center text-gray-500 py-12">
            Producto no encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-square bg-brand-bg rounded-2xl overflow-hidden border border-brand-blue/20">
              <div className="absolute inset-6">
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col">
              {product.category && (
                <Link
                  href={`/categoria/${product.category.id}`}
                  className="text-xs font-medium text-brand-blue uppercase tracking-wider hover:text-brand-blue/80"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-black mt-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mt-3 leading-relaxed">
                {product.description || "Sin descripción."}
              </p>

              <div className="mt-6">
                <p className="text-3xl font-bold text-brand-blue">
                  {symbol} {price.toFixed(2)}
                </p>
                {payment === "bolivares" && product.price_usd != null && (
                  <p className="text-sm text-gray-500 mt-1">
                    Ref. USD {Number(product.price_usd).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {!product.is_active ? (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    No disponible
                  </span>
                ) : product.stock > 0 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {product.stock} disponible(s)
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Agotado
                  </span>
                )}
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full py-3 px-6 bg-brand-accent-green text-white text-center font-medium rounded-lg hover:bg-brand-accent-green/90 transition-colors"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
