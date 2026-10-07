import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Fauna da Serra | Monitoramento Colaborativo da Biodiversidade",
  description: "Plataforma colaborativa de Ciência Cidadã para catalogar, monitorar e registrar a fauna silvestre nativa de Araçoiaba da Serra e região.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  referrer: "no-referrer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased text-gray-800">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
