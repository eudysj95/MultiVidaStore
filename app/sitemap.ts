import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

type Row = { id: string; updated_at: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return routes;

  try {
    const supabase = createClient(url, key);
    const [{ data: categories }, { data: products }] = await Promise.all([
      supabase.from("categories").select("id, updated_at"),
      supabase.from("products").select("id, updated_at").eq("is_active", true),
    ]);

    for (const category of (categories ?? []) as Row[]) {
      routes.push({
        url: `${baseUrl}/categoria/${category.id}`,
        lastModified: category.updated_at
          ? new Date(category.updated_at)
          : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const product of (products ?? []) as Row[]) {
      routes.push({
        url: `${baseUrl}/producto/${product.id}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Si Supabase no está disponible, devolvemos al menos las rutas estáticas.
  }

  return routes;
}
