import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tesoreria Santa Ana",
  description: "Migracion segura de NetBeans a Next.js para tesoreria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
