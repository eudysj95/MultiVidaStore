import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="w-full flex items-center justify-center">
      <Image
        src="/images/logo.png"
        alt="MultiVida Store"
        className="w-full h-auto object-contain rounded-2xl"
        width={727}
        height={343}
        loading="eager"
        priority
      />
    </section>
  );
}
