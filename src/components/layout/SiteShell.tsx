"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, BookOpen, PlusCircle } from "lucide-react";
import { FaunaLogo } from "@/components/ui/FaunaLogo";
import { MobileNavDrawer } from "@/components/fauna/MobileNavDrawer";
import { MobileBottomNav } from "@/components/fauna/MobileBottomNav";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen flex flex-col bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AccessibilityToolbar />
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <FaunaLogo size="md" />
              <div>
                <span className="text-lg font-bold text-gray-900 block leading-tight">Fauna da Serra</span>
                <span className="text-xs text-forest-700 font-medium">Ciência Cidadã & Biodiversidade</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-forest-700 transition">
                Início
              </Link>
              <Link href="/especies" className="flex items-center gap-1.5 text-gray-600 hover:text-forest-700 transition">
                <BookOpen className="w-4 h-4 text-forest-600" />
                Guia de Espécies
              </Link>
              <Link href="/emergencias" className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 transition font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Emergências
              </Link>
              <Link
                href="/ocorrencias/nova"
                className="flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Animal
              </Link>
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <MobileNavDrawer />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <MobileBottomNav />

      <footer className="bg-forest-950 text-gray-300 py-10 border-t border-forest-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="space-y-1">
              <p className="font-bold text-white text-base">Fauna da Serra • Monitoramento Colaborativo</p>
              <p className="text-xs text-gray-400">
                Iniciativa Acadêmica de Ciência Cidadã • UNIVESP (Projeto Integrador II)
              </p>
              <p className="text-xs text-gray-400">
                Mapeamento e Proteção à Biodiversidade nas Áreas Verdes de Araçoiaba da Serra e Região
              </p>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Canal Colaborativo de Educação Ambiental e Apoio ao Resgate da Fauna Silvestre</p>
              <p>Desenvolvido em conformidade com as diretrizes de Acessibilidade Digital (WCAG 2.1 AA)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
