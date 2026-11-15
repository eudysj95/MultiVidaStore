"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import "@/app/globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSupabaseReady(true);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        setSession(data.session);
        setSupabaseReady(true);
        if (!data.session) {
          router.push("/admin/login");
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
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

  const isLoginPage = pathname === "/admin/login";
  const redirecting = supabaseReady && !session && !isLoginPage;
  const showOverlay = !supabaseReady || redirecting;

  // Modo desarrollo sin Supabase: renderizar children directamente
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="font-bold text-brand-black text-lg">MultiVida Store</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/products"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                >
                  Productos
                </Link>
                <Link
                  href="/admin/categories"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                >
                  Categorías
                </Link>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="font-bold text-brand-black text-lg">MultiVida Store</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/products"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                >
                  Productos
                </Link>
                <Link
                  href="/admin/categories"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                >
                  Categorías
                </Link>
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
      )}

      {isLoginPage ? (
        children
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      )}

      {showOverlay && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent mb-4"></div>
            <p className="text-gray-600">
              {redirecting
                ? "Redirigiendo al login..."
                : "Cargando panel de administración..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
