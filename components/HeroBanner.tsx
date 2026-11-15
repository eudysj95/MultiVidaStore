import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="w-full flex items-center justify-center">
      <Image
        src="/images/logo.jpeg"
        alt="MultiVida Store"
        className="w-full h-auto object-contain"
        width={1280}
        height={321}
        loading="eager"
        priority
      />
    </section>
  );
}
