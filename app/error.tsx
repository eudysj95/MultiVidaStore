"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-5xl font-extrabold text-brand-accent-red">Ups</p>
        <h1 className="mt-4 text-2xl font-bold text-brand-black">
          Algo salió mal
        </h1>
        <p className="mt-2 text-gray-600">
          Ocurrió un error inesperado. Podés intentar de nuevo.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-blue/90"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="rounded-lg border border-brand-blue px-5 py-2.5 font-medium text-brand-blue transition-colors hover:bg-brand-blue/5"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
