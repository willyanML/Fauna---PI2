"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, AlertCircle, Search, X, ChevronRight, PawPrint } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaunaImage } from "@/components/fauna/FaunaImage";
import { ESPECIES_REGIONAIS, type EspecieData } from "@/lib/mock-data";
import { correspondeBusca } from "@/lib/utils";

export default function EspeciesPage() {
  const [especiesLista, setEspeciesLista] = useState<EspecieData[]>(ESPECIES_REGIONAIS);
  const [busca, setBusca] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState<string>("TODOS");

  useEffect(() => {
    fetch("/api/especies")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEspeciesLista(data);
        }
      })
      .catch(() => {});
  }, []);

  const filtros = [
    { id: "TODOS", label: "Todas as Espécies" },
    { id: "MAMIFERO", label: "Mamíferos" },
    { id: "AVE", label: "Aves" },
    { id: "REPTIL", label: "Répteis" },
    { id: "AMEACADAS", label: "Ameaçadas (VU/EN)" },
  ];

  const especiesFiltradas = useMemo(() => {
    return especiesLista.filter((esp) => {
      // Filtro por grupo/categoria
      if (grupoFiltro === "AMEACADAS") {
        if (!esp.ameacadaExtincao) return false;
      } else if (grupoFiltro !== "TODOS") {
        if (esp.grupo !== grupoFiltro) return false;
      }

      // Filtro por termo de busca com suporte a com e sem acento
      if (!busca.trim()) return true;
      return (
        correspondeBusca(esp.nomePopular, busca) ||
        correspondeBusca(esp.nomeCientifico, busca) ||
        correspondeBusca(esp.descricao, busca) ||
        correspondeBusca(esp.habitat, busca)
      );
    });
  }, [especiesLista, busca, grupoFiltro]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-3">
        <div className="inline-flex">
          <Badge variant="forest" className="gap-1.5 py-1 px-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia Biológico de Araçoiaba da Serra</span>
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Fauna Silvestre Regional
        </h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm sm:text-base">
          Catálogo com fotografias reais das principais espécies nativas de Araçoiaba da Serra e do entorno da Floresta Nacional de Ipanema (Flona). Toque em qualquer espécie para ver mais detalhes e fotos registradas nos bairros.
        </p>
      </div>

      {/* Controles de Filtro e Busca Mobile-First */}
      <div className="space-y-4 bg-muted/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar por nome popular, científico ou habitat..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 pr-10 h-12 bg-white rounded-xl text-sm border-gray-200 focus-visible:ring-forest-600"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barra de Pílulas Horizontais Deslizantes por Toque (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          {filtros.map((filtro) => {
            const isAtivo = grupoFiltro === filtro.id;
            return (
              <button
                key={filtro.id}
                onClick={() => setGrupoFiltro(filtro.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 shrink-0 min-h-[40px] flex items-center gap-1.5 ${
                  isAtivo
                    ? "bg-forest-700 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-forest-50 hover:text-forest-800 border border-gray-200"
                }`}
              >
                {filtro.label}
              </button>
            );
          })}
        </div>

        {/* Indicador de Quantidade */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Mostrando <strong>{especiesFiltradas.length}</strong> de{" "}
            <strong>{especiesLista.length}</strong> espécies catalogadas
          </span>
          {(busca || grupoFiltro !== "TODOS") && (
            <button
              onClick={() => {
                setBusca("");
                setGrupoFiltro("TODOS");
              }}
              className="text-forest-700 font-semibold hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de Cards de Espécies */}
      {especiesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {especiesFiltradas.map((esp) => (
            <Link
              key={esp.id}
              href={`/especies/${esp.id}`}
              className="group block focus:outline-none focus:ring-2 focus:ring-forest-600 rounded-3xl"
            >
              <Card className="overflow-hidden hover:shadow-lg hover:border-forest-300 transition-all duration-300 flex flex-col justify-between h-full bg-card">
                <div>
                  <div className="h-56 overflow-hidden relative bg-muted">
                    <FaunaImage
                      src={esp.fotoReferenciaUrl}
                      alt={`Fotografia real de ${esp.nomePopular} (${esp.nomeCientifico})`}
                      fallbackTitle={esp.nomePopular}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-black/75 backdrop-blur-sm border-0 text-white text-xs shadow-xs">
                        {esp.grupo}
                      </Badge>
                      {esp.ameacadaExtincao && (
                        <Badge className="bg-amber-600/95 text-white backdrop-blur-sm border-0 gap-1 text-[11px] font-bold shadow-xs">
                          <AlertCircle className="w-3 h-3" />
                          Ameaçada (VU)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="space-y-1 p-5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-bold group-hover:text-forest-700 transition-colors">
                          {esp.nomePopular}
                        </CardTitle>
                        <CardDescription className="text-xs italic font-serif text-muted-foreground">
                          {esp.nomeCientifico}
                        </CardDescription>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-forest-700 group-hover:translate-x-1 transition shrink-0 mt-0.5" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-1 space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {esp.descricao}
                    </p>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  {esp.orientacoesConvivencia && (
                    <div className="bg-forest-50/80 border border-forest-100 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-forest-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                        <span>Convivência Segura</span>
                      </div>
                      <p className="text-[11px] text-gray-700 line-clamp-2 leading-relaxed">
                        {esp.orientacoesConvivencia}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-forest-700 font-semibold pt-1 border-t border-gray-100">
                    <span>Ver detalhes e avistamentos</span>
                    <span className="text-base">&rarr;</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-muted/20 rounded-3xl border border-dashed border-border space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto">
            <PawPrint className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Nenhuma espécie encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Não encontramos animais correspondentes aos filtros selecionados.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setBusca("");
              setGrupoFiltro("TODOS");
            }}
            className="rounded-xl"
          >
            Limpar Filtros e Mostrar Todas
          </Button>
        </div>
      )}
    </div>
  );
}
