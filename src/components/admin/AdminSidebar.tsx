"use client";

import Link from "next/link";
import {
  PawPrint,
  Images,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  UserCheck,
  Sparkles,
  X,
  LogOut,
} from "lucide-react";
import { FaunaLogo } from "@/components/ui/FaunaLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminTab = "especies" | "carrossel" | "curadoria";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  stats: {
    totalEspecies: number;
    totalCarrosselItens: number;
    totalCarrosselAtivos: number;
    limiteMaximo: number;
    ocorrenciasPendentes: number;
    ocorrenciasValidadas: number;
  };
  onReset: () => void;
  resetting: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onLogout?: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  stats,
  onReset,
  resetting,
  mobileOpen,
  setMobileOpen,
  onLogout,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: "especies" as AdminTab,
      label: "Catálogo de Espécies",
      description: "CRUD & 10 campos taxonômicos",
      icon: PawPrint,
      badge: stats.totalEspecies.toString(),
      badgeColor: "bg-forest-100 text-forest-800",
    },
    {
      id: "carrossel" as AdminTab,
      label: "Carrossel & Mídias da Home",
      description: "Esteira Hero panorâmica",
      icon: Images,
      badge: `${stats.totalCarrosselAtivos}/${stats.limiteMaximo}`,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "curadoria" as AdminTab,
      label: "Curadoria de Ocorrências",
      description: "Moderação de fotos de munícipes",
      icon: ShieldCheck,
      badge: stats.ocorrenciasPendentes > 0 ? `${stats.ocorrenciasPendentes} pendentes` : "0 pendentes",
      badgeColor: stats.ocorrenciasPendentes > 0 ? "bg-amber-500 text-white font-extrabold animate-pulse" : "bg-gray-100 text-gray-600",
    },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
      <div className="space-y-6">
        {/* Top Branding */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <Link href="/admin" className="flex items-center gap-3 group">
            <FaunaLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-gray-900 tracking-tight leading-none">
                  Fauna da Serra
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-forest-900 text-white">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-forest-700 font-semibold block mt-0.5">
                Painel de Controle e Gestão
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">
            Módulos Administrativos
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-200 group ${
                  isActive
                    ? "bg-forest-900 text-white shadow-md shadow-forest-950/20"
                    : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-forest-50 group-hover:text-forest-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] block leading-tight mt-0.5 ${
                        isActive ? "text-forest-200" : "text-gray-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 space-y-2 border-t border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-0.5">
            Ações Rápidas
          </p>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-start rounded-xl text-xs font-semibold text-gray-700 hover:bg-forest-50 hover:text-forest-800 border-gray-200 h-9"
          >
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5 mr-2 text-forest-600" />
              <span>Ver Site Público</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={resetting}
            className="w-full justify-start rounded-xl text-xs font-semibold text-rose-700 border-rose-200/80 hover:bg-rose-50 h-9"
            title="Restaura os dados originais calibrados de Araçoiaba da Serra"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-2 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Restaurando Padrões..." : "Restaurar Fábrica"}</span>
          </Button>
        </div>
      </div>

      {/* Admin User Footer Box */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/90 border border-gray-200/60">
          <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            FS
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-gray-900 block truncate leading-tight">
              faunadaserra
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              Administrador • PI2
            </span>
          </div>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              title="Encerrar sessão (Logout)"
              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Sessão Ativa" />
          )}
        </div>
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Módulo restrito de administração
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
