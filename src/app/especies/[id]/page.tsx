import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Camera,
  PawPrint,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaunaImage } from "@/components/fauna/FaunaImage";
import {
  getEspecieById,
  getOcorrenciasValidadasPorEspecie,
} from "@/lib/conteudo-service";

export const dynamic = "force-dynamic";

interface EspecieDetailPageProps {
  params: { id: string };
}

export default async function EspecieDetailPage({ params }: EspecieDetailPageProps) {
  const { id } = params;
  const especie = await getEspecieById(id);

  if (!especie) {
    notFound();
  }

  // Busca ocorrências nos bairros aprovadas pelo Admin para esta espécie
  const ocorrenciasAprovadas = await getOcorrenciasValidadasPorEspecie(id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Botão Voltar */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-forest-800 -ml-2 rounded-xl">
          <Link href="/especies" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Guia de Espécies
          </Link>
        </Button>
      </div>

      {/* Ficha Biológica Principal */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Foto Oficial de Referência */}
          <div className="h-72 sm:h-96 md:h-full min-h-[300px] relative bg-muted">
            <FaunaImage
              src={especie.fotoReferenciaUrl}
              alt={`Fotografia de ${especie.nomePopular}`}
              fallbackTitle={especie.nomePopular}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-black/75 backdrop-blur-sm text-white border-0 text-xs shadow-sm">
                {especie.grupo}
              </Badge>
              {especie.ameacadaExtincao && (
                <Badge className="bg-amber-600 text-white border-0 gap-1 text-xs font-bold shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Ameaçada ({especie.statusConservacao})
                </Badge>
              )}
            </div>
          </div>

          {/* Dados Taxonômicos e Descrição */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-forest-700 font-bold uppercase tracking-wider block">
                  Fauna Nativa de Araçoiaba da Serra
                </span>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                  {especie.nomePopular}
                </h1>
                <p className="text-sm italic font-serif text-muted-foreground mt-0.5">
                  {especie.nomeCientifico}
                </p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <strong className="block text-gray-900 font-semibold">Descrição e Hábitos:</strong>
                <p>{especie.descricao}</p>
              </div>

              <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                <strong className="block text-gray-900 font-semibold">Habitat Regional:</strong>
                <p>{especie.habitat}</p>
              </div>
            </div>

            {/* Caixa de Orientações de Convivência */}
            {especie.orientacoesConvivencia && (
              <div className="bg-forest-50/80 border border-forest-100 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
                  <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
                  <span>Orientações de Convivência e Segurança</span>
                </div>
                <p className="text-xs text-forest-950/85 leading-relaxed">
                  {especie.orientacoesConvivencia}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção Ciência Cidadã: Galeria dos Bairros com Fotos Validadas */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-forest-700" />
              <h2 className="text-xl font-bold text-gray-900">
                Avistamentos Registrados nos Bairros
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fotografias reais enviadas pelos moradores de Araçoiaba da Serra e validadas pela equipe do projeto
            </p>
          </div>

          <Button asChild size="sm" className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shrink-0">
            <Link href="/ocorrencias/nova" className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Registrar Avistamento
            </Link>
          </Button>
        </div>

        {/* Galeria de Fotos Aprovadas */}
        {ocorrenciasAprovadas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ocorrenciasAprovadas.map((ocorr) => (
              <Card
                key={ocorr.id}
                className="overflow-hidden rounded-2xl bg-white border-gray-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition"
              >
                <div>
                  <div className="h-52 relative bg-muted overflow-hidden">
                    <FaunaImage
                      src={ocorr.fotoUrl}
                      alt={`Registro de ${especie.nomePopular} em ${ocorr.bairroAreaVerde}`}
                      fallbackTitle={`Registro em ${ocorr.bairroAreaVerde}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <Badge className="absolute top-2.5 right-2.5 bg-emerald-600 text-white border-0 text-[10px] font-bold shadow-sm">
                      Validado em Campo
                    </Badge>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start gap-1.5 text-xs text-gray-800">
                      <MapPin className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      <span className="font-bold">{ocorr.bairroAreaVerde}</span>
                    </div>

                    {ocorr.observacoes && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
                        "{ocorr.observacoes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {new Date(ocorr.dataHoraAvistamento).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-mono text-gray-400">{ocorr.protocolo}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Estado Vazio Educativo e Acolhedor */
          <Card className="p-10 text-center rounded-3xl bg-forest-50/50 border border-forest-100 space-y-4">
            <div className="w-14 h-14 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-gray-900">
                Nenhum avistamento confirmado recentemente nos bairros
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você avistou este animal em Araçoiaba da Serra ou na região da Flona de Ipanema? Registre pelo celular para enriquecer o mapeamento comunitário!
              </p>
            </div>
            <div>
              <Button asChild size="sm" className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm">
                <Link href="/ocorrencias/nova" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Fotografar e Registrar Agora
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
