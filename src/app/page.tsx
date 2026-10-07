import Link from "next/link";
import { Camera, BookOpen, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HeroMarqueeBackground } from "@/components/fauna/HeroMarqueeBackground";
import { FaunaImage } from "@/components/fauna/FaunaImage";
import { getCarrosselHero, getEspecies } from "@/lib/conteudo-service";
import { ESPECIES_REGIONAIS } from "@/lib/mock-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [carrosselItens, todasEspecies] = await Promise.all([
    getCarrosselHero().catch(() => []),
    getEspecies().catch(() => []),
  ]);

  const especiesDestaque = todasEspecies.length > 0
    ? todasEspecies.filter((e) => e.exibirNoCarrosselHome ?? true)
    : ESPECIES_REGIONAIS;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border">
        <HeroMarqueeBackground itens={carrosselItens} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6 bg-background/80 backdrop-blur-md py-8 px-6 sm:py-10 sm:px-12 rounded-3xl border border-border/50 shadow-xl">
            <div className="inline-flex">
              <Badge variant="forest" className="text-xs uppercase tracking-wider py-1 px-3">
                Ciência Cidadã • Araçoiaba da Serra e Região
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Monitoramento Colaborativo da <span className="text-forest-700">Fauna Silvestre</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ajude a mapear e proteger a biodiversidade de <strong>Araçoiaba da Serra e região</strong>. Registre seus avistamentos em áreas verdes, aprenda sobre as espécies nativas e saiba como agir ao encontrar animais silvestres feridos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-xl shadow-md">
                <Link href="/ocorrencias/nova" className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Registrar Avistamento Agora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl shadow-sm">
                <Link href="/especies" className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-forest-700" />
                  Explorar Guia da Fauna
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Alerta Rápido para Animais Feridos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert variant="warning" className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-amber-600 mt-1" />
            <div className="space-y-1">
              <AlertTitle className="text-lg font-bold text-amber-950">
                Encontrou um animal ferido ou em situação de perigo?
              </AlertTitle>
              <AlertDescription className="text-sm text-amber-900 leading-relaxed">
                Não tente manusear animais de grande porte ou peçonhentos. Consulte nosso protocolo de orientação e os canais públicos de socorro (Defesa Civil, Bombeiros e Polícia Ambiental).
              </AlertDescription>
            </div>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm shrink-0">
            <Link href="/emergencias">
              Ver Orientações de Resgate
            </Link>
          </Button>
        </Alert>
      </section>

      {/* Pilares do Projeto */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Como funciona o monitoramento</h2>
          <p className="text-sm text-muted-foreground">Unindo a comunidade e a conservação da biodiversidade através da ciência cidadã</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:border-forest-300 transition shadow-sm">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 bg-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold text-xl">
                1
              </div>
              <CardTitle className="text-lg">Avistou um animal?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed text-gray-600">
                Tire uma foto e registre o avistamento pelo celular. O sistema obtém sua localização exata via GPS e salva as informações mesmo sem sinal de internet no momento.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:border-forest-300 transition shadow-sm">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 bg-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold text-xl">
                2
              </div>
              <CardTitle className="text-lg">Curadoria Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed text-gray-600">
                Estudantes e pesquisadores analisam a fotografia, verificam a identificação taxonômica da espécie e confirmam o registro para a base de dados.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:border-forest-300 transition shadow-sm">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 bg-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold text-xl">
                3
              </div>
              <CardTitle className="text-lg">Proteção e Planejamento</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed text-gray-600">
                Os dados consolidados ficam disponíveis de forma aberta para apoiar estudos ecológicos, ações de preservação, redução de atropelamentos e proteção da fauna regional.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Espécies com Imagens Reais Verificadas */}
      <section className="bg-muted/40 py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Fauna em Destaque</h2>
              <p className="text-sm text-muted-foreground">Fotografias reais de espécies nativas registradas em Araçoiaba da Serra e região</p>
            </div>
            <Button asChild variant="link" className="p-0 text-forest-700 font-semibold">
              <Link href="/especies">
                Ver todas as espécies &rarr;
              </Link>
            </Button>
          </div>

          <div className="relative px-2 sm:px-6">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6">
                {especiesDestaque.map((esp) => (
                  <CarouselItem
                    key={esp.id}
                    className="pl-4 sm:pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/70 flex flex-col h-full bg-card">
                      <div className="h-48 overflow-hidden relative bg-muted">
                        <FaunaImage
                          src={esp.fotoReferenciaUrl}
                          alt={`Foto real de ${esp.nomePopular}`}
                          fallbackTitle={esp.nomePopular}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                        <Badge className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white border-0 text-[11px] shadow-sm">
                          {esp.grupo}
                        </Badge>
                        {esp.ameacadaExtincao && (
                          <Badge className="absolute top-2.5 left-2.5 bg-amber-600 text-white border-0 text-[10px] shadow-sm">
                            Ameaçada
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="p-4 space-y-1 flex-1">
                        <CardTitle className="text-base font-bold group-hover:text-forest-700 transition-colors">
                          {esp.nomePopular}
                        </CardTitle>
                        <CardDescription className="text-xs italic font-mono text-muted-foreground">
                          {esp.nomeCientifico}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-1 font-normal leading-relaxed">
                          {esp.descricao}
                        </p>
                      </CardHeader>
                      <div className="p-4 pt-0">
                        <Button asChild variant="ghost" size="sm" className="w-full justify-between text-xs text-forest-700 hover:text-forest-800 hover:bg-forest-50 p-2 h-auto rounded-lg font-semibold">
                          <Link href={`/especies/${esp.id}`}>
                            Ver no Guia &rarr;
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 sm:-left-5" />
              <CarouselNext className="-right-3 sm:-right-5" />
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}
