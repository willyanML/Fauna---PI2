"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, MapPin, AlertCircle, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaunaImage } from "@/components/fauna/FaunaImage";
import { type OcorrenciaData, type EspecieData } from "@/lib/conteudo-types";

interface AdminCuradoriaTabProps {
  ocorrencias: OcorrenciaData[];
  especies: EspecieData[];
  onModerar: (id: string, status: "VALIDADO" | "REJEITADO", especieId?: string | null) => Promise<void>;
  moderating: boolean;
}

export function AdminCuradoriaTab({
  ocorrencias,
  especies,
  onModerar,
  moderating,
}: AdminCuradoriaTabProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>("PENDENTE");
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);
  const [especieSelecionadaMap, setEspecieSelecionadaMap] = useState<Record<string, string>>({});

  const ocorrenciasFiltradas = ocorrencias.filter((o) => {
    if (filtroStatus === "TODAS") return true;
    return o.statusValidacao === filtroStatus;
  });

  const handleAprovar = async (ocorr: OcorrenciaData) => {
    try {
      const especieCorrigida = especieSelecionadaMap[ocorr.id] || ocorr.especieSugeridaId;
      await onModerar(ocorr.id, "VALIDADO", especieCorrigida);
      setFeedback({
        tipo: "sucesso",
        msg: `Ocorrência ${ocorr.protocolo} aprovada com sucesso! A fotografia agora está pública na galeria da espécie.`,
      });
    } catch (err: any) {
      setFeedback({ tipo: "erro", msg: err.message || "Falha ao aprovar ocorrência." });
    }
  };

  const handleRejeitar = async (ocorr: OcorrenciaData) => {
    try {
      await onModerar(ocorr.id, "REJEITADO", ocorr.especieSugeridaId);
      setFeedback({
        tipo: "sucesso",
        msg: `Ocorrência ${ocorr.protocolo} marcada como rejeitada/arquivada.`,
      });
    } catch (err: any) {
      setFeedback({ tipo: "erro", msg: err.message || "Falha ao rejeitar ocorrência." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Orientações da Curadoria */}
      <Card className="p-6 rounded-3xl bg-white border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-700" />
              Curadoria de Avistamentos & Moderação da Galeria
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analise os relatos enviados pelos moradores em campo. Apenas fotos aprovadas aparecem publicamente no Guia de Espécies dos bairros.
            </p>
          </div>

          {/* Filtros de Status */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "PENDENTE", label: "Pendentes" },
              { id: "VALIDADO", label: "Aprovadas" },
              { id: "REJEITADO", label: "Rejeitadas" },
              { id: "TODAS", label: "Todas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroStatus(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  filtroStatus === f.id
                    ? "bg-forest-700 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <Alert variant={feedback.tipo === "sucesso" ? "default" : "destructive"} className="rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs font-semibold">{feedback.msg}</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Lista de Ocorrências na Fila de Moderação */}
      {ocorrenciasFiltradas.length > 0 ? (
        <div className="space-y-4">
          {ocorrenciasFiltradas.map((ocorr) => {
            const especieAtual = especies.find((e) => e.id === ocorr.especieSugeridaId);
            const especieEscolhida = especieSelecionadaMap[ocorr.id] || ocorr.especieSugeridaId || "";

            return (
              <Card
                key={ocorr.id}
                className="overflow-hidden rounded-3xl bg-white border-gray-200 shadow-xs p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {/* Foto enviada pelo morador */}
                  <div className="w-full md:w-56 h-48 md:h-44 rounded-2xl overflow-hidden bg-muted shrink-0 border border-gray-200 relative">
                    <FaunaImage
                      src={ocorr.fotoUrl}
                      alt={`Foto de ${ocorr.protocolo}`}
                      fallbackTitle="Foto do avistamento"
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2.5 left-2.5 text-[10px] font-bold border-0 shadow-xs ${
                        ocorr.statusValidacao === "VALIDADO"
                          ? "bg-emerald-600 text-white"
                          : ocorr.statusValidacao === "REJEITADO"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {ocorr.statusValidacao === "VALIDADO"
                        ? "Aprovada na Galeria"
                        : ocorr.statusValidacao === "REJEITADO"
                        ? "Rejeitada"
                        : "Aguardando Análise"}
                    </Badge>
                  </div>

                  {/* Informações da Ocorrência */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-lg border border-forest-200">
                          {ocorr.protocolo}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ocorr.dataHoraAvistamento).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <Badge variant="outline" className="text-xs font-semibold">
                        Condição: {ocorr.statusAnimal}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <MapPin className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-gray-900">Local / Bairro:</strong>
                          <span>{ocorr.bairroAreaVerde}</span>
                          <span className="block text-[11px] font-mono text-muted-foreground">
                            GPS: {ocorr.latitude.toFixed(4)}, {ocorr.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-gray-900">
                          Classificação da Espécie:
                        </label>
                        <select
                          value={especieEscolhida}
                          onChange={(e) =>
                            setEspecieSelecionadaMap({
                              ...especieSelecionadaMap,
                              [ocorr.id]: e.target.value,
                            })
                          }
                          className="w-full h-9 px-2.5 rounded-xl border border-input text-xs bg-background"
                        >
                          <option value="">Não identificada / Outra</option>
                          {especies.map((esp) => (
                            <option key={esp.id} value={esp.id}>
                              {esp.nomePopular} ({esp.nomeCientifico})
                            </option>
                          ))}
                        </select>
                        {especieAtual && (
                          <span className="text-[11px] text-muted-foreground block">
                            Indicada pelo cidadão: <strong>{especieAtual.nomePopular}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {ocorr.observacoes && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-700">
                        <strong>Relato do morador:</strong> {ocorr.observacoes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações de Moderação */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-muted-foreground">
                    {ocorr.aprovadoParaGaleria ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Visível publicamente na página da espécie
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Foto oculta do público até aprovação
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ocorr.statusValidacao !== "REJEITADO" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={moderating}
                        onClick={() => handleRejeitar(ocorr)}
                        className="text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50 rounded-xl"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Rejeitar Foto
                      </Button>
                    )}

                    {ocorr.statusValidacao !== "VALIDADO" && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={moderating}
                        onClick={() => handleAprovar(ocorr)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs px-4"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Aprovar Foto para a Galeria da Espécie
                      </Button>
                    )}

                    {ocorr.statusValidacao === "VALIDADO" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={moderating}
                        onClick={() => handleRejeitar(ocorr)}
                        className="text-xs font-semibold text-gray-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                      >
                        Revogar da Galeria
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center rounded-3xl bg-muted/20 border-dashed border-border space-y-3">
          <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-gray-900">
            Nenhuma ocorrência encontrada para o filtro selecionado
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Todos os avistamentos correspondentes foram processados ou não há registros na fila.
          </p>
        </Card>
      )}
    </div>
  );
}
