export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
