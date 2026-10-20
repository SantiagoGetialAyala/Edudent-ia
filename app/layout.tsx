import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edudent-IA",
  description: "Plataforma educativa 3D para morfologia dental"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
