import Link from "next/link";
import { AlertTriangle, PhoneCall, CheckCircle2, XCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function EmergenciasPage() {
  const telefonesUteis = [
    {
      orgao: "Defesa Civil (Emergência Municipal)",
      descricao: "Atendimento 24h para apoio em resgate de animais em situação de risco, vias públicas ou acidentes.",
      telefone: "199",
      plantao: "Ligação Gratuita 24h",
      badge: "Emergência 24h",
    },
    {
      orgao: "Polícia Militar Ambiental (Região Metropolitana)",
      descricao: "Atendimento a ocorrências de crimes ambientais, tráfico, caça ilegal e captura técnica de animais silvestres de médio e grande porte.",
      telefone: "(15) 3224-2108",
      plantao: "190",
      badge: "Policiamento Ambiental",
    },
    {
      orgao: "Corpo de Bombeiros",
      descricao: "Apoio especializado em resgates de difícil acesso (árvores altas, poços, barrancos e margens de rios).",
      telefone: "193",
      plantao: "Plantão 24 horas",
      badge: "Salvamento Geral",
    },
    {
      orgao: "CRAS / CETAS (Triagem de Animais Silvestres Regional)",
      descricao: "Centros técnicos regionais conveniados para triagem, atendimento médico-veterinário e reabilitação de espécimes resgatados.",
      telefone: "Encaminhamento Técnico",
      plantao: "Acionado via Defesa Civil ou Polícia Ambiental",
      badge: "Reabilitação",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Cabeçalho de Alerta Crítico */}
      <div className="bg-amber-600 text-white rounded-3xl p-8 sm:p-10 shadow-lg space-y-4">
        <div className="inline-flex">
          <Badge className="bg-black/25 text-white border-0 text-xs font-semibold gap-1.5 py-1 px-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Protocolo de Atendimento a Ocorrências Críticas</span>
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Emergências com Fauna Silvestre
        </h1>
        <p className="text-amber-50 text-base sm:text-lg max-w-2xl leading-relaxed">
          Encontrou um animal atropelado, machucado ou acuado em Araçoiaba da Serra? Saiba como agir com segurança e acione os canais de socorro imediato.
        </p>

        <div className="pt-2">
          <Button asChild size="lg" className="bg-white text-amber-950 hover:bg-amber-50 font-bold rounded-xl shadow-md">
            <Link href="/ocorrencias/nova?status=FERIDO" className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              Notificar Equipe com GPS Agora
            </Link>
          </Button>
        </div>
      </div>

      {/* Regras de O que Fazer e Não Fazer com Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Alert variant="forest" className="p-6 sm:p-8 space-y-3 bg-emerald-50/80 border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <AlertTitle className="text-base font-bold text-emerald-950">O QUE VOCÊ DEVE FAZER</AlertTitle>
          </div>
          <AlertDescription>
            <ul className="space-y-3 text-sm text-emerald-950 pt-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Mantenha distância:</strong> Observe o animal sem se aproximar excessivamente para não deixá-lo assustado.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Afaste animais domésticos:</strong> Tranque cães e gatos em outro cômodo para evitar acidentes e brigas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Fotografe à distância:</strong> Uma foto nítida auxilia os biólogos na identificação prévia da espécie.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Sinalize a via:</strong> Se o animal estiver na pista em vicinal, ligue o pisca-alerta do veículo.</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert variant="destructive" className="p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-lg">
            <XCircle className="w-6 h-6 text-rose-600" />
            <AlertTitle className="text-base font-bold text-rose-950">O QUE NUNCA FAZER</AlertTitle>
          </div>
          <AlertDescription>
            <ul className="space-y-3 text-sm text-rose-950 pt-2">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span><strong>Não tente capturar com as mãos:</strong> Animais feridos tendem a morder ou arranhar por autodefesa.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span><strong>Não ofereça comida ou leite:</strong> A alimentação inadequada pode ser letal dependendo do trauma.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span><strong>Não remova filhotes sozinhos:</strong> Em muitas espécies, os pais estão por perto aguardando você se afastar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span><strong>Não aplique medicamentos humanos:</strong> Pomadas ou remédios podem causar intoxicação aguda.</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Telefones Úteis com Cards shadcn */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Canais Telefônicos de Emergência</h2>
          <p className="text-sm text-muted-foreground">Ligue diretamente para os órgãos competentes que realizam atendimento em Araçoiaba da Serra</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {telefonesUteis.map((item, idx) => (
            <Card key={idx} className="flex flex-col justify-between shadow-sm">
              <CardHeader className="space-y-2 p-6 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-bold">{item.orgao}</CardTitle>
                  <Badge variant="forest">{item.badge}</Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed text-gray-600">{item.descricao}</CardDescription>
              </CardHeader>

              <CardFooter className="border-t p-6 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">Telefone:</span>
                  <span className="text-lg font-extrabold text-foreground">{item.telefone}</span>
                  <span className="text-xs text-forest-700 block font-medium">{item.plantao}</span>
                </div>
                <Button asChild size="icon" className="rounded-xl shadow-sm">
                  <a href={`tel:${item.telefone.replace(/\D/g, "")}`} aria-label={`Ligar para ${item.orgao}`}>
                    <PhoneCall className="w-5 h-5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
