import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="w-full flex items-center justify-center bg-white py-4">
        <Image
          src="/images/logo.jpeg"
          alt="MultiVida Store"
          className="h-32 md:h-40 object-contain max-w-full"
          width={800}
          height={400}
          loading="eager"
          priority
        />
    </section>
  );
}
