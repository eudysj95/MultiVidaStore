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
      <div className="group h-full bg-brand-bg rounded-2xl overflow-hidden border border-brand-blue/20 hover:border-brand-blue/40 transition-colors">
        <div className={`relative bg-transparent overflow-hidden ${imageClassName}`}>
          <div className="absolute inset-4">
            <Image
              src={image}
              alt={name}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-brand-black text-lg leading-tight">{name}</h3>
        </div>
      </div>
    </Link>
  );
}
