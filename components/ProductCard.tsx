"use client";

import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  href: string;
}

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  rating = 5,
  href,
}: ProductCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <Link href={href} className="block">
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
            <span className="text-xs text-gray-500 ml-1">({Math.floor(Math.random() * 50) + 1})</span>
          </div>
          <h3 className="font-semibold text-brand-black text-sm leading-tight line-clamp-2 mb-2">
            {name}
          </h3>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="font-bold text-brand-blue text-lg">Bs. {price.toLocaleString()}</span>
            {oldPrice && (
              <span className="text-gray-400 text-sm line-through">
                Bs. {oldPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
