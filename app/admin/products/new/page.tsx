import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Nuevo producto</h1>
        <p className="text-gray-600">Agrega un producto al catálogo</p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
