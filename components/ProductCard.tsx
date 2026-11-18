"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Currency = "bolivares" | "dolar" | "cashea";

export type { Currency };

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  bolivares: "Bs.",
  dolar: "USD",
  cashea: "Cashea",
};

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  href?: string;
  currency?: Currency;
}

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  href,
  currency: currencyProp,
}: ProductCardProps) {
  const searchParams = useSearchParams();
  const currency = (currencyProp ||
    (searchParams.get("payment") as Currency) ||
    "bolivares") as Currency;
  const symbol = CURRENCY_SYMBOLS[currency];

  const imageSrc =
    image && (image.startsWith("https://") || image.startsWith("/"))
      ? image
      : "/images/categories/cafeteras.png";

  // ⚠️ Reemplazá este número por el WhatsApp real del dueño
  const whatsappNumber = "584246187569";
  const [productLink, setProductLink] = useState("");

  // Solo en el cliente, capturamos la URL actual para el mensaje de WhatsApp
  useEffect(() => {
    setProductLink(window.location.href);
  }, []);

  const message = `Hola, me interesa el producto "${name}" a ${symbol} ${price.toFixed(2)}. Link: ${productLink}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const productHref = href || `/producto/${id}`;

  return (
    <div className="group block">
      <div className="bg-brand-bg rounded-2xl overflow-hidden border border-brand-blue/20 hover:border-brand-blue/40 transition-colors flex flex-col h-full">
        <Link href={productHref} className="block flex-1">
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            <Image
              src={imageSrc}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {oldPrice && (
              <span className="absolute top-2 right-2 bg-brand-black text-white text-xs font-bold px-2 py-1 rounded-md">
                -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
              </span>
            )}
          </div>
          <div className="p-4 pb-2">
            <h3 className="font-semibold text-brand-black text-sm leading-tight line-clamp-2 mb-2">
              {name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-brand-blue text-lg">
                {symbol} {price.toFixed(2)}
              </span>
              {oldPrice && (
                <span className="text-gray-400 text-sm line-through">
                  {symbol} {oldPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="p-4 pt-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 bg-brand-accent-green text-white text-center text-sm font-medium rounded-lg hover:bg-brand-accent-green/90 transition-colors"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
