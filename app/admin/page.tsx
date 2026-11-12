export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  // Si Supabase no está configurado, permitir acceso (modo desarrollo)
  if (!supabase) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
            <p className="text-gray-600">Bienvenido al panel de administración</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Modo desarrollo
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
          <p className="text-sm text-yellow-800">
            Supabase no está configurado. Para habilitar la autenticación real,
            crea un archivo <code className="font-mono">.env.local</code> con
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Productos</h3>
            <p className="text-3xl font-bold text-brand-black mt-2">—</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ventas hoy</h3>
            <p className="text-3xl font-bold text-brand-black mt-2">—</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categorías</h3>
            <p className="text-3xl font-bold text-brand-black mt-2">—</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-brand-black mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/products"
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-blue hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-brand-black">Gestionar productos</h3>
              <p className="text-sm text-gray-500 mt-1">Crear, editar y eliminar productos</p>
            </a>
            <a
              href="/admin/categories"
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-blue hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-brand-black">Gestionar categorías</h3>
              <p className="text-sm text-gray-500 mt-1">Crear y editar categorías</p>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de administración</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            En línea
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjetas de resumen */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Productos</h3>
          <p className="text-3xl font-bold text-brand-black mt-2">—</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ventas hoy</h3>
          <p className="text-3xl font-bold text-brand-black mt-2">—</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categorías</h3>
          <p className="text-3xl font-bold text-brand-black mt-2">—</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-brand-black mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/products"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-blue hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-brand-black">Gestionar productos</h3>
            <p className="text-sm text-gray-500 mt-1">Crear, editar y eliminar productos</p>
          </a>
          <a
            href="/admin/categories"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-blue hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-brand-black">Gestionar categorías</h3>
            <p className="text-sm text-gray-500 mt-1">Crear y editar categorías</p>
          </a>
        </div>
      </div>
    </div>
  );
}
