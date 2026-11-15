"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase || !id) {
      setLoading(false);
      return;
    }

    supabase
      .from("products")
      .select(
        "id, name, description, category_id, price_bs, price_usd, price_cashea, image_url, stock, is_active"
      )
      .eq("id", id)
      .single()
      .then(
        ({
          data,
          error,
        }: {
          data: ProductFormValues | null;
          error: { message: string } | null;
        }) => {
          if (error) {
            setError(error.message);
          } else {
            setProduct(data as ProductFormValues);
          }
          setLoading(false);
        }
      );
  }, [supabase, id]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Editar producto</h1>
        <p className="text-gray-600">Modifica los datos del producto</p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center py-20 text-gray-500">Cargando producto...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : product ? (
        <ProductForm mode="edit" initial={product} />
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center py-20 text-gray-500">Producto no encontrado</div>
        </div>
      )}
    </div>
  );
}
