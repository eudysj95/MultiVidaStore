import CategoryForm from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Nueva categoría</h1>
        <p className="text-gray-600">Agrega una categoría al catálogo</p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
