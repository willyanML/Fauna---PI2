"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Camera, AlertTriangle } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isEspecies = pathname.startsWith("/especies");
  const isNovaOcorrencia = pathname === "/ocorrencias/nova";
  const isEmergencias = pathname.startsWith("/emergencias");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe"
      aria-label="Navegação inferior mobile"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Aba Início */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition ${
            isHome ? "text-forest-700 font-bold" : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
        >
          <div className="relative p-1">
            <Home className="w-5 h-5" />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-forest-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] leading-tight mt-0.5">Início</span>
        </Link>

        {/* Aba Guia de Espécies */}
        <Link
          href="/especies"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition ${
            isEspecies ? "text-forest-700 font-bold" : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
        >
          <div className="relative p-1">
            <BookOpen className="w-5 h-5" />
            {isEspecies && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-forest-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] leading-tight mt-0.5">Guia</span>
        </Link>

        {/* Botão Central Elevado: Registrar Animal com Câmera */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <Link
            href="/ocorrencias/nova"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-forest-800 to-forest-600 hover:from-forest-900 hover:to-forest-700 text-white flex items-center justify-center shadow-md border-2 border-white active:scale-95 transition transform"
            aria-label="Registrar animal avistado"
          >
            <Camera className="w-5 h-5" />
          </Link>
          <span
            className={`text-[10px] font-bold mt-1 ${
              isNovaOcorrencia ? "text-forest-800" : "text-gray-600"
            }`}
          >
            Registrar
          </span>
        </div>

        {/* Aba Emergências */}
        <Link
          href="/emergencias"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition ${
            isEmergencias ? "text-amber-700 font-bold" : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
        >
          <div className="relative p-1">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            {isEmergencias && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-amber-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] leading-tight mt-0.5">Socorro</span>
        </Link>
      </div>
    </nav>
  );
}
