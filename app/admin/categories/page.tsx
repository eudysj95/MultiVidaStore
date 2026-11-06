"use client";

import Link from "next/link";

export default function CategoriesPage() {
  const categories = [
    { name: "Cafeteras", count: 12 },
    { name: "Cocinas", count: 8 },
    { name: "Lavadoras", count: 15 },
    { name: "Licuadoras", count: 20 },
    { name: "Neveras", count: 10 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Categorías</h1>
          <p className="text-gray-600">Gestiona las categorías de productos</p>
        </div>
        <Link
          href="#"
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
        >
          + Nueva categoría
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Productos</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.name}>
                <td className="px-6 py-4 font-medium text-brand-black">
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-medium">
                  {cat.count}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2">
                    <Link
                      href="#"
                      className="text-brand-blue hover:text-brand-blue/90 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
