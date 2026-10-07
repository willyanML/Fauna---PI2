"use client";

import Link from "next/link";
import { Menu, ExternalLink, Shield, Sparkles, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type AdminTab } from "@/components/admin/AdminSidebar";

interface AdminTopbarProps {
  activeTab: AdminTab;
  onOpenMobileSidebar: () => void;
  saving?: boolean;
  onLogout?: () => void;
}

export function AdminTopbar({
  activeTab,
  onOpenMobileSidebar,
  saving,
  onLogout,
}: AdminTopbarProps) {
  const titles: Record<AdminTab, { title: string; subtitle: string }> = {
    especies: {
      title: "Catálogo de Espécies Nativas",
      subtitle: "Gestão biológica com padrão rigoroso de 10 campos obrigatórios",
    },
    carrossel: {
      title: "Carrossel Hero & Mídias da Home",
      subtitle: "Curadoria de imagens ativas na esteira infinita da página inicial",
    },
    curadoria: {
      title: "Curadoria de Fotos Comunitárias",
      subtitle: "Auditoria e aprovação de registros enviados pelos moradores nos bairros",
    },
  };

  const current = titles[activeTab] || titles.especies;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
              {current.title}
            </h1>
            {saving && (
              <Badge variant="outline" className="text-[10px] text-forest-700 border-forest-300 animate-pulse">
                Sincronizando...
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Sistema Ativo</span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-gray-200 text-gray-700 hover:bg-forest-50 hover:text-forest-800 rounded-xl text-xs h-9 px-3"
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Ver Site</span>
            <span className="sm:hidden">Site</span>
          </Link>
        </Button>

        {onLogout && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs h-9 px-2.5"
            title="Encerrar sessão de administrador"
          >
            <LogOut className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        )}
      </div>
    </header>
  );
}
