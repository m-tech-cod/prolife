import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProLife - Nous sommes pour la vie",
  description: "Plateforme de gestion des membres de la communauté ProLife.",
  icons: {
    icon: "/images/logo.webp",
    shortcut: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
  openGraph: {
    title: "ProLife",
    description: "Nous ne sommes pas pour la mort, nous sommes pour la vie.",
    url: "https://prolife.vercel.app",
    siteName: "ProLife Community",
    images: [
      {
        url: "/images/logo.webp",
        width: 800,
        height: 600,
        alt: "ProLife Community Logo",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}