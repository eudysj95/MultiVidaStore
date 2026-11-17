import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-6xl font-extrabold text-brand-blue">404</p>
        <h1 className="mt-4 text-2xl font-bold text-brand-black">
          Página no encontrada
        </h1>
        <p className="mt-2 text-gray-600">
          La página que buscás no existe o fue movida.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-brand-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-blue/90"
          >
            Volver al inicio
          </Link>
          <Link
            href="/buscar"
            className="rounded-lg border border-brand-blue px-5 py-2.5 font-medium text-brand-blue transition-colors hover:bg-brand-blue/5"
          >
            Buscar productos
          </Link>
        </div>
      </div>
    </div>
  );
}
