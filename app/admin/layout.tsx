"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    // Si Supabase no está configurado, permitir acceso (modo desarrollo)
    if (!supabase) {
      setSupabaseReady(true);
      setLoading(false);
      return;
    }

    // Verificar sesión al cargar
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSupabaseReady(true);
      setLoading(false);
      if (!data.session) {
        router.push("/admin/login");
      }
    });

    // Escuchar cambios de auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (event === "SIGNED_OUT") {
          router.push("/admin/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // Si Supabase no está configurado, mostrar hijos directamente (modo dev)
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-black text-lg">MultiVida Store</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/admin/products"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                >
                  Productos
                </a>
                <a
                  href="/admin/categories"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                >
                  Categorías
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    );
  }

  if (!session) {
    return null; // El useEffect redirige
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-black text-lg">MultiVida Store</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/admin/products"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
              >
                Productos
              </a>
              <a
                href="/admin/categories"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
              >
                Categorías
              </a>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
