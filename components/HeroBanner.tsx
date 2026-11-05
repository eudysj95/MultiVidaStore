import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl bg-gray-900">
      {/* Imagen de fondo del banner (placeholder) */}
      <Image
        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80"
        alt="Banner MultiVidaStore"
        className="w-full h-full object-cover"
        priority
        sizes="100vw"
        width={1600}
        height={900}
        fill={false}
      />
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
        <Image
          src="/images/logo.jpeg"
          alt="MultiVida Store"
          className="mb-4 h-20 md:h-24 object-contain"
          priority
          width={600}
          height={300}
        />
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-brand-accent-red uppercase bg-white/20 backdrop-blur rounded-full border border-white/30">
          Oferta especial
        </span>
        <p className="text-lg md:text-xl opacity-90 max-w-md">
          Electrodomésticos y tecnología al mejor precio. Consulta tu producto
          por WhatsApp.
        </p>
      </div>
    </section>
  );
}
