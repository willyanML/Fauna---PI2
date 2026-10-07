"use client";

import { BookOpen, Images, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AdminStatsCardsProps {
  stats: {
    totalEspecies: number;
    totalCarrosselItens: number;
    totalCarrosselAtivos: number;
    limiteMaximo: number;
    ocorrenciasPendentes: number;
    ocorrenciasValidadas: number;
  };
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:border-forest-200 transition">
        <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
            Espécies Catalogadas
          </span>
          <span className="text-xl font-extrabold text-gray-900">
            {stats.totalEspecies}
          </span>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:border-emerald-200 transition">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <Images className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
            Carrossel Home
          </span>
          <span className="text-xl font-extrabold text-gray-900">
            {stats.totalCarrosselAtivos}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              / {stats.limiteMaximo} máx
            </span>
          </span>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:border-amber-200 transition">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
            Curadoria Pendente
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-gray-900">
              {stats.ocorrenciasPendentes}
            </span>
            {stats.ocorrenciasPendentes > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:border-blue-200 transition">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
            Fotos Aprovadas
          </span>
          <span className="text-xl font-extrabold text-gray-900">
            {stats.ocorrenciasValidadas}
          </span>
        </div>
      </Card>
    </div>
  );
}
