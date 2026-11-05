import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="w-full py-20 flex items-center justify-center bg-white">
      <Image
        src="/images/logo.jpeg"
        alt="MultiVida Store"
        className="h-32 md:h-40 object-contain max-w-full"
        width={800}
        height={400}
      />
    </section>
  );
}
