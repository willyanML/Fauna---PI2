import { type CarrosselItem } from "@/lib/conteudo-types";
import { ESPECIES_REGIONAIS } from "@/lib/mock-data";

interface HeroMarqueeBackgroundProps {
  itens?: CarrosselItem[];
}

export function HeroMarqueeBackground({ itens }: HeroMarqueeBackgroundProps) {
  // Se fornecido itens do painel admin com status ativo, usamos; senão usamos o catálogo padrão
  const listaBase = (itens && itens.length > 0)
    ? itens.map((item) => ({
        id: item.id,
        nomePopular: item.titulo,
        nomeCientifico: item.subtitulo,
        grupo: item.grupo,
        fotoReferenciaUrl: item.fotoUrl,
        ameacadaExtincao: false,
      }))
    : ESPECIES_REGIONAIS;

  // Duplicamos ou multiplicamos a lista para criar a esteira contínua infinita sem cortes
  const multiplier = listaBase.length < 5 ? 4 : 2;
  const especiesDuplicadas = Array.from({ length: multiplier }, () => listaBase).flat();

  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Esteira contínua preenchendo a altura total da section */}
      <div className="absolute inset-0 flex items-center [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex gap-4 sm:gap-6 animate-marquee w-max h-[calc(100%-1rem)] items-center my-auto">
          {especiesDuplicadas.map((especie, index) => (
            <div
              key={`${especie.id}-${index}`}
              className="relative w-72 sm:w-96 md:w-[28rem] h-full shrink-0 rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg bg-card"
            >
              <img
                src={especie.fotoReferenciaUrl}
                alt={especie.nomePopular}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              {/* Sombra inferior suave no card para identificação da espécie */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white drop-shadow-md">
                <div>
                  <p className="text-base sm:text-lg font-bold tracking-tight">
                    {especie.nomePopular}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-200 italic font-serif">
                    {especie.nomeCientifico}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/20">
                    {especie.grupo}
                  </span>
                  {especie.ameacadaExtincao && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500 text-amber-950">
                      Ameaçada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Camada translúcida calibrada: mantém as fotos 100% visíveis e vívidas enquanto assegura legibilidade aos textos */}
      <div className="absolute inset-0 bg-background/60 dark:bg-background/70 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/90" />
    </div>
  );
}
