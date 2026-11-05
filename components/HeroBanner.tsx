import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl bg-brand-black">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
        <Image
          src="/images/logo.jpeg"
          alt="MultiVida Store"
          className="mb-6 h-24 md:h-32 object-contain"
          priority
          width={800}
          height={400}
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
