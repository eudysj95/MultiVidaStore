"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
  className?: string;
  imageClassName?: string;
}

export default function CategoryCard({
  name,
  image,
  href,
  className = "",
  imageClassName = "aspect-square",
}: CategoryCardProps) {
  return (
    <Link href={href} className={`block ${className}`}>
      <div className="group h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className={`relative bg-gray-50 overflow-hidden ${imageClassName}`}>
          <Image
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        </div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-brand-black text-lg leading-tight">{name}</h3>
        </div>
      </div>
    </Link>
  );
}
