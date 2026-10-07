"use client";

import { useEffect, useState } from "react";
import { Type, RotateCcw } from "lucide-react";

const STORAGE_KEY = "fauna_font_scale";
const SCALES = ["90%", "100%", "115%", "125%"] as const;
type ScaleValue = (typeof SCALES)[number];

export function AccessibilityToolbar() {
  const [scale, setScale] = useState<ScaleValue>("100%");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as ScaleValue | null;
    if (saved && SCALES.includes(saved)) {
      setScale(saved);
      document.documentElement.style.fontSize = saved;
    } else {
      document.documentElement.style.fontSize = "100%";
    }
  }, []);

  const aplicarEscala = (novaEscala: ScaleValue) => {
    setScale(novaEscala);
    document.documentElement.style.fontSize = novaEscala;
    try {
      localStorage.setItem(STORAGE_KEY, novaEscala);
    } catch {
      // localStorage indisponível
    }
  };

  const aumentarFonte = () => {
    const currentIndex = SCALES.indexOf(scale);
    if (currentIndex < SCALES.length - 1) {
      aplicarEscala(SCALES[currentIndex + 1]);
    }
  };

  const diminuirFonte = () => {
    const currentIndex = SCALES.indexOf(scale);
    if (currentIndex > 0) {
      aplicarEscala(SCALES[currentIndex - 1]);
    }
  };

  const resetarFonte = () => {
    aplicarEscala("100%");
  };

  return (
    <div
      role="region"
      aria-label="Barra de Acessibilidade Governamental"
      data-hydrated={mounted ? "true" : "false"}
      className="bg-forest-950 text-emerald-100/90 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-forest-900 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Identificação Institucional / Governamental */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-200/80 truncate">
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-100">Portal Público de Biodiversidade</span>
          <span className="hidden md:inline text-emerald-400/60">•</span>
          <span className="hidden md:inline text-emerald-300/80">Araçoiaba da Serra • SP</span>
        </div>

        {/* Controles de Acessibilidade (e-MAG / Gov.br) */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-200/80 font-medium">
            <Type className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
            <span>Tamanho da fonte:</span>
          </span>

          <div
            className="flex items-center bg-forest-900/90 rounded-lg p-0.5 border border-forest-800"
            role="group"
            aria-label="Ajuste de tamanho do texto"
          >
            <button
              id="btn-font-decrease"
              type="button"
              onClick={diminuirFonte}
              disabled={mounted && scale === SCALES[0]}
              title="Diminuir tamanho da fonte (A-)"
              aria-label="Diminuir tamanho da fonte (A-)"
              className="px-2 py-0.5 rounded text-xs font-bold transition hover:bg-forest-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              A-
            </button>

            <button
              id="btn-font-reset"
              type="button"
              onClick={resetarFonte}
              title="Tamanho padrão de fonte (100%)"
              aria-label="Tamanho padrão de fonte (100%)"
              className={`px-2 py-0.5 rounded text-xs font-bold transition hover:bg-forest-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                scale === "100%" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-200"
              }`}
            >
              A
            </button>

            <button
              id="btn-font-increase"
              type="button"
              onClick={aumentarFonte}
              disabled={mounted && scale === SCALES[SCALES.length - 1]}
              title="Aumentar tamanho da fonte (A+)"
              aria-label="Aumentar tamanho da fonte (A+)"
              className="px-2 py-0.5 rounded text-xs font-bold transition hover:bg-forest-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              A+
            </button>
          </div>

          {/* Indicador visual de zoom percentual */}
          {mounted && scale !== "100%" && (
            <span
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-forest-900/80 px-1.5 py-0.5 rounded border border-forest-800"
              title="Escala de visualização ativa"
            >
              {scale}
              <button
                type="button"
                onClick={resetarFonte}
                className="hover:text-white ml-0.5"
                title="Restaurar tamanho normal"
                aria-label="Restaurar tamanho normal"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
