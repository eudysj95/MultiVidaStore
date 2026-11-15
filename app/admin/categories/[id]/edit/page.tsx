"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/CategoryForm";
import { createClient } from "@/lib/supabase";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [category, setCategory] = useState<CategoryFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase || !id) {
      setLoading(false);
      return;
    }

    supabase
      .from("categories")
      .select("id, name, description, icon_url")
      .eq("id", id)
      .single()
      .then(
        ({
          data,
          error,
        }: {
          data: CategoryFormValues | null;
          error: { message: string } | null;
        }) => {
          if (error) {
            setError(error.message);
          } else {
            setCategory(data);
          }
          setLoading(false);
        }
      );
  }, [supabase, id]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Editar categoría</h1>
        <p className="text-gray-600">Modifica los datos de la categoría</p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center py-20 text-gray-500">Cargando categoría...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : category ? (
        <CategoryForm mode="edit" initial={category} />
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center py-20 text-gray-500">Categoría no encontrada</div>
        </div>
      )}
    </div>
  );
}
