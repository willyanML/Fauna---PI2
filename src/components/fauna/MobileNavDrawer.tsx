"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Camera,
  AlertTriangle,
  PhoneCall,
  Shield,
  ChevronRight,
} from "lucide-react";
import { FaunaLogo } from "@/components/ui/FaunaLogo";

export function MobileNavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha o drawer automaticamente ao mudar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Previne rolagem do body quando o menu está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    {
      href: "/",
      label: "Início",
      desc: "Página principal e destaques",
      icon: Home,
      color: "text-forest-700 bg-forest-50",
    },
    {
      href: "/especies",
      label: "Guia de Espécies",
      desc: "Catálogo regional da fauna nativa",
      icon: BookOpen,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      href: "/ocorrencias/nova",
      label: "Registrar Animal",
      desc: "Fotografe e envie avistamento com GPS",
      icon: Camera,
      color: "text-forest-800 bg-forest-100 font-bold",
    },
    {
      href: "/emergencias",
      label: "Emergências 24h",
      desc: "Animais feridos, resgate e socorro",
      icon: AlertTriangle,
      color: "text-amber-700 bg-amber-50",
    },
  ];

  return (
    <div className="md:hidden">
      {/* Botão Hambúrguer no Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-gray-700 hover:text-forest-700 hover:bg-forest-50 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-forest-600"
        aria-label="Abrir menu de navegação"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer com Portal no document.body para isolamento total de z-index */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Gaveta Deslizante (Drawer) */}
            <aside
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[10000] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out translate-x-0"
              aria-label="Menu principal"
            >
        {/* Cabeçalho do Drawer */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-forest-50/60 to-white">
          <div className="flex items-center gap-3">
            <FaunaLogo size="sm" />
            <div>
              <span className="text-base font-extrabold text-gray-900 block leading-tight">
                Fauna da Serra
              </span>
              <span className="text-[11px] text-forest-700 font-medium block">
                Ciência Cidadã & Biodiversidade
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Menu de Navegação
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-3 rounded-2xl transition group ${
                  isActive
                    ? "bg-forest-50 border border-forest-200 text-forest-900 font-semibold shadow-xs"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${item.color} shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block leading-tight">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground block font-normal">
                      {item.desc}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-forest-700 group-hover:translate-x-0.5 transition" />
              </Link>
            );
          })}

          {/* Card de Chamada para Ação Rápida */}
          <div className="pt-4">
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Socorro Imediato a Animais</span>
              </div>
              <p className="text-xs text-amber-950/80 leading-relaxed">
                Animal ferido na pista ou em perigo em Araçoiaba da Serra?
              </p>
              <div className="flex gap-2">
                <a
                  href="tel:199"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Defesa Civil (199)
                </a>
                <a
                  href="tel:193"
                  className="inline-flex items-center justify-center bg-white border border-amber-300 text-amber-900 font-semibold text-xs py-2 px-3 rounded-xl hover:bg-amber-100/50 transition"
                >
                  193
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da Gaveta */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 text-center space-y-1">
          <p className="text-[11px] font-semibold text-gray-700">
            Araçoiaba da Serra • UNIVESP (PI2)
          </p>
          <p className="text-[10px] text-muted-foreground">
            Apoiando a preservação da fauna regional
          </p>
        </div>
      </aside>
    </div>,
    document.body
  )}
</div>
);
}
