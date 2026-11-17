import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "MultiVida Store",
    template: "%s | MultiVida Store",
  },
  description:
    "Electrodomésticos y tecnología al mejor precio. Consulta tus productos por WhatsApp.",
  keywords: [
    "electrodomésticos",
    "tecnología",
    "MultiVida Store",
    "Venezuela",
    "cocinas",
    "neveras",
    "lavadoras",
    "licuadoras",
    "cafeteras",
  ],
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "MultiVida Store",
    title: "MultiVida Store",
    description:
      "Electrodomésticos y tecnología al mejor precio. Consulta tus productos por WhatsApp.",
    images: [
      {
        url: "/images/logo.png",
        width: 727,
        height: 343,
        alt: "MultiVida Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MultiVida Store",
    description:
      "Electrodomésticos y tecnología al mejor precio. Consulta tus productos por WhatsApp.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#ffffff" }}>
        <Suspense fallback={<div>Cargando...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}
