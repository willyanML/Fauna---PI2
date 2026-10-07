"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, BookOpen, Images, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FaunaLogo } from "@/components/ui/FaunaLogo";

interface AdminHeaderProps {
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
}

export function AdminHeader({ stats, onReset, resetting }: AdminHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Barra de Título Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <FaunaLogo size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Painel de Controle & Curadoria
              </h1>
              <Badge variant="forest" className="text-[11px] font-bold py-0.5">
                Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gestão de mídias, espécies biológicas e validação de fotos comunitárias de Araçoiaba da Serra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={resetting}
            className="text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50 rounded-xl"
            title="Restaura as fotos e espécies originais de fábrica"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Restaurando..." : "Restaurar Padrões"}
          </Button>

          <Button asChild size="sm" className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl shadow-xs">
            <Link href="/" className="flex items-center gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Ver Site Público
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
              Espécies no Catálogo
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              {stats.totalEspecies}
            </span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5">
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

        <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
              Ocorrências Pendentes
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

        <Card className="p-4 rounded-2xl bg-white border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
              Fotos Aprovadas (Bairros)
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              {stats.ocorrenciasValidadas}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
