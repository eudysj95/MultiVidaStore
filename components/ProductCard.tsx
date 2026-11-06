"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

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
  rating?: number;
  href?: string;
  currency?: Currency;
}

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  rating = 5,
  href,
  currency: currencyProp,
}: ProductCardProps) {
  const searchParams = useSearchParams();
  const currency = (currencyProp ||
    (searchParams.get("payment") as Currency) ||
    "bolivares") as Currency;
  const symbol = CURRENCY_SYMBOLS[currency];

  // ⚠️ Reemplazá este número por el WhatsApp real del dueño
  const whatsappNumber = "584246187569";
  const productLink =
    typeof window !== "undefined" ? window.location.href : "";
  const message = `Hola, me interesa el producto "${name}" a ${symbol} ${price.toLocaleString()}. Link: ${productLink}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <div className="block cursor-pointer hover:shadow-lg transition-shadow">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={image}
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
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-1 mb-1">
            {stars.map((_, i) => (
              <span key={i} className="text-yellow-400 text-xs">
                ★
              </span>
            ))}
            <span className="text-xs text-gray-500 ml-1">(128 reseñas)</span>
          </div>
          <h3 className="font-semibold text-brand-black text-sm leading-tight line-clamp-2 mb-2">
            {name}
          </h3>
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-brand-blue text-lg">
                {symbol} {price.toLocaleString()}
              </span>
              {oldPrice && (
                <span className="text-gray-400 text-sm line-through">
                  {symbol} {oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 bg-brand-green text-white text-center text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
