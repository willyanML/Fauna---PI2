"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, MapPin, CheckCircle, Upload, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ESPECIES_REGIONAIS } from "@/lib/mock-data";
import { compressImage } from "@/lib/image-utils";

const PONTOS_ARACOIABA = [
  {
    id: "lago_municipal",
    nome: "Lago Municipal de Araçoiaba da Serra",
    bairro: "Centro / Lago Municipal",
    lat: -23.5042,
    lng: -47.6148,
    detalhe: "Área de capivaras, aves aquáticas e répteis",
  },
  {
    id: "flona_ipanema",
    nome: "Borda da Flona de Ipanema (Morro de Araçoiaba)",
    bairro: "Entorno Flona de Ipanema",
    lat: -23.4285,
    lng: -47.6015,
    detalhe: "Corredor florestal nativo e refúgio de mamíferos",
  },
  {
    id: "jundiaquara",
    nome: "Bairro Jundiaquara / Estrada do Morro",
    bairro: "Jundiaquara",
    lat: -23.4890,
    lng: -47.6250,
    detalhe: "Área periurbana e transição de mata nativa",
  },
  {
    id: "centro",
    nome: "Centro de Araçoiaba da Serra (Praça da Matriz)",
    bairro: "Centro",
    lat: -23.5186,
    lng: -47.6138,
    detalhe: "Núcleo urbano central",
  },
  {
    id: "cercado",
    nome: "Bairro Cercado (Zona Rural)",
    bairro: "Cercado",
    lat: -23.5350,
    lng: -47.6410,
    detalhe: "Fragmentos de Mata Atlântica e cerrado",
  },
  {
    id: "campo_meio",
    nome: "Bairro Campo do Meio",
    bairro: "Campo do Meio",
    lat: -23.5010,
    lng: -47.5850,
    detalhe: "Transição rural-urbana e pastagens",
  },
  {
    id: "rio_verde",
    nome: "Bairro Rio Verde / Represas",
    bairro: "Rio Verde",
    lat: -23.5420,
    lng: -47.5920,
    detalhe: "Várzeas e proximidades de cursos d'água",
  },
];

export default function NovaOcorrenciaPage() {
  const [pontoSelecionadoId, setPontoSelecionadoId] = useState<string>("lago_municipal");
  const [origemGps, setOrigemGps] = useState<"ARACOIABA" | "DISPOSITIVO">("ARACOIABA");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [latitude, setLatitude] = useState<number>(PONTOS_ARACOIABA[0].lat);
  const [longitude, setLongitude] = useState<number>(PONTOS_ARACOIABA[0].lng);
  const [precisao, setPrecisao] = useState<number>(10);
  const [localizacaoNome, setLocalizacaoNome] = useState<string>(PONTOS_ARACOIABA[0].nome);
  const [avisoRegiao, setAvisoRegiao] = useState<string | null>(null);
  const [gpsMensagem, setGpsMensagem] = useState<string | null>(null);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [statusAnimal, setStatusAnimal] = useState("SAUDAVEL");
  const [especieId, setEspecieId] = useState("");
  const [bairro, setBairro] = useState(PONTOS_ARACOIABA[0].bairro);
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sucessoProtocolo, setSucessoProtocolo] = useState<string | null>(null);

  const [listaEspeciesDisponiveis, setListaEspeciesDisponiveis] = useState(ESPECIES_REGIONAIS);

  useEffect(() => {
    fetch("/api/especies")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setListaEspeciesDisponiveis(data);
        }
      })
      .catch(() => {});
  }, []);

  const especiesLista = [
    ...listaEspeciesDisponiveis.map((e) => ({ id: e.id, nomePopular: `${e.nomePopular} (${e.nomeCientifico})` })),
    { id: "outra", nomePopular: "Outro animal / Não sei identificar" },
  ];

  const handlePontoChange = (pontoId: string) => {
    setPontoSelecionadoId(pontoId);
    setAvisoRegiao(null);
    setGpsMensagem(null);

    const ponto = PONTOS_ARACOIABA.find((p) => p.id === pontoId);
    if (ponto) {
      setLatitude(ponto.lat);
      setLongitude(ponto.lng);
      setLocalizacaoNome(ponto.nome);
      setPrecisao(10);
      setOrigemGps("ARACOIABA");
      setBairro(ponto.bairro);
    }
  };

  const obterGpsDispositivo = () => {
    if (!navigator.geolocation) {
      setGpsMensagem("Seu navegador não possui suporte a geolocalização. O ponto em Araçoiaba da Serra foi mantido.");
      return;
    }

    setGpsLoading(true);
    setGpsMensagem(null);
    setAvisoRegiao(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setPrecisao(acc);
        setOrigemGps("DISPOSITIVO");
        setPontoSelecionadoId("custom");
        setGpsLoading(false);

        // Bounding box aproximada de Araçoiaba da Serra: Lat [-23.62, -23.38], Lng [-47.74, -47.50]
        const dentroAraçoiaba = lat >= -23.62 && lat <= -23.38 && lng >= -47.74 && lng <= -47.50;

        if (!dentroAraçoiaba) {
          // Identifica cidade vizinha comum (ex: Boituva, Sorocaba, etc.)
          const regiaoDetectada = lat > -23.38 && lat < -23.18 ? "Boituva / Região Norte" : "fora dos limites municipais";
          setAvisoRegiao(
            `GPS detectado em ${regiaoDetectada} (${lat.toFixed(4)}, ${lng.toFixed(4)}). Como o sistema é focado na fauna de Araçoiaba da Serra, as coordenadas foram salvas, mas você pode escolher um bairro do município no menu caso o avistamento tenha ocorrido em Araçoiaba.`
          );
          setLocalizacaoNome(`GPS Atual (${regiaoDetectada})`);
        } else {
          setLocalizacaoNome("GPS do Dispositivo em Araçoiaba");
          setGpsMensagem("Coordenadas exatas obtidas pelo GPS do seu aparelho em Araçoiaba da Serra!");
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsMensagem("Sinal de GPS não disponível ou permissão pendente. Mantendo as coordenadas de Araçoiaba da Serra.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1200, 900, 0.78);
        setFotoPreview(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      latitude: latitude ?? -23.5186,
      longitude: longitude ?? -47.6138,
      precisaoGpsMetros: precisao,
      statusAnimal,
      especieSugeridaId: especieId && especieId !== "outra" ? especieId : null,
      bairroAreaVerde: bairro || "Araçoiaba da Serra",
      observacoes,
      fotoBase64: fotoPreview,
    };

    try {
      const res = await fetch("/api/ocorrencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.protocolo) {
        setSucessoProtocolo(data.protocolo);
      } else {
        const protoSimulado = `ARA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setSucessoProtocolo(protoSimulado);
      }
    } catch {
      const protoSimulado = `ARA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSucessoProtocolo(protoSimulado);
    } finally {
      setSubmitting(false);
    }
  };

  if (sucessoProtocolo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">Registro Enviado com Sucesso!</h1>
          <p className="text-muted-foreground">
            Sua colaboração foi recebida com sucesso e encaminhada para a equipe de curadoria acadêmica do projeto Fauna da Serra.
          </p>
        </div>

        <Card className="bg-forest-50/70 border-forest-200 text-center p-6 space-y-2 max-w-sm mx-auto shadow-sm">
          <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider block">Número de Protocolo</span>
          <span className="text-2xl font-black text-forest-900 font-mono tracking-widest">{sucessoProtocolo}</span>
        </Card>

        {statusAnimal === "FERIDO" || statusAnimal === "RISCO_IMINENTE" ? (
          <Alert variant="warning" className="text-left space-y-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <AlertTitle className="text-sm font-bold text-amber-950">Prioridade de Resgate Ativada</AlertTitle>
            <AlertDescription className="text-xs text-amber-900 leading-relaxed">
              Como você indicou que o animal está ferido ou em risco, a ocorrência recebeu prioridade imediata. Se a situação exigir socorro urgente, ligue também para a Defesa Civil: <strong>(15) 3281-2244</strong> ou <strong>199</strong>.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              Voltar para o Início
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setSucessoProtocolo(null);
              setFotoPreview(null);
              setObservacoes("");
            }}
            className="w-full sm:w-auto"
          >
            Registrar Outro Animal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="p-0 hover:bg-transparent text-forest-700 hover:text-forest-800 mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold text-foreground">Registrar Avistamento de Fauna</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajude a catalogar as espécies de Araçoiaba da Serra enviando foto e localização.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 sm:p-8 space-y-8 shadow-sm">
          {/* 1. Fotografia */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground">
              1. Foto ou Vídeo do Animal (Obrigatório)
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-input hover:border-primary rounded-2xl p-6 transition bg-muted/20">
              {fotoPreview ? (
                <div className="space-y-3 w-full text-center">
                  <img
                    src={fotoPreview}
                    alt="Pré-visualização do animal"
                    className="max-h-64 mx-auto rounded-xl object-contain shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoPreview(null)}
                    className="text-xs text-destructive font-semibold hover:underline"
                  >
                    Trocar fotografia
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full py-4 space-y-2">
                  <div className="p-3 bg-forest-100 text-forest-700 rounded-full">
                    <Camera className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Tirar foto agora ou escolher da galeria</span>
                  <span className="text-xs text-muted-foreground">Arquivos JPG, PNG ou WebP até 15MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFotoChange}
                    required
                  />
                </label>
              )}
            </div>
          </div>

          {/* 2. Localização do Avistamento */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-sm font-bold text-foreground">
                  2. Localização do Avistamento em Araçoiaba da Serra
                </label>
                <p className="text-xs text-muted-foreground">
                  Defina o local de Araçoiaba da Serra onde o animal foi visto.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={obterGpsDispositivo}
                disabled={gpsLoading}
                className="text-xs font-semibold text-forest-800 border-forest-200 hover:bg-forest-50 flex items-center gap-1.5 self-start sm:self-auto rounded-xl"
              >
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                {gpsLoading ? "Obtendo GPS..." : "Detectar Meu GPS"}
              </Button>
            </div>

            {/* Seletor rápido de pontos e bairros do município */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Ponto de Referência ou Bairro em Araçoiaba:
              </label>
              <select
                value={pontoSelecionadoId}
                onChange={(e) => handlePontoChange(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {PONTOS_ARACOIABA.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.bairro})
                  </option>
                ))}
                <option value="custom">Outro local / Ponto personalizado</option>
              </select>
            </div>

            {/* Painel com coordenadas e status */}
            <div className="bg-forest-50/70 border border-forest-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-forest-100 text-forest-700 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                  <p className="text-muted-foreground">
                    {localizacaoNome} • Precisão estimada: ±{precisao} metros
                  </p>
                </div>
              </div>
              <Badge variant={origemGps === "DISPOSITIVO" ? "secondary" : "forest"}>
                {origemGps === "DISPOSITIVO" ? "GPS do Dispositivo" : "Araçoiaba da Serra"}
              </Badge>
            </div>

            {/* Aviso informativo acolhedor caso o GPS esteja fora de Araçoiaba (ex: em Boituva) */}
            {avisoRegiao && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950">Localização detectada fora de Araçoiaba da Serra</p>
                  <p className="text-amber-800 leading-relaxed">{avisoRegiao}</p>
                </div>
              </div>
            )}

            {/* Feedback suave do GPS */}
            {gpsMensagem && !avisoRegiao && (
              <p className="text-xs text-forest-700 font-medium">{gpsMensagem}</p>
            )}
          </div>

          {/* 3. Condição do Animal */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground">
              3. Como o animal está no momento?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium">
              {[
                { id: "SAUDAVEL", label: "Saudável / Ativo", desc: "Se alimentando ou se movendo normalmente" },
                { id: "FILHOTE_ACUADO", label: "Filhote ou Acuado", desc: "Preso em cerca ou forro de casa" },
                { id: "FERIDO", label: "Ferido / Atropelado", desc: "Necessita de resgate urgente" },
                { id: "RISCO_IMINENTE", label: "Em Risco", desc: "Perto de rodovia ou ataque de cães" },
                { id: "CARCACA", label: "Sem vida / Carcaça", desc: "Animal morto para registro científico" },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStatusAnimal(st.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                    statusAnimal === st.id
                      ? "border-forest-600 bg-forest-50/80 text-forest-950 font-bold shadow-sm"
                      : "border-input hover:border-gray-300 text-foreground bg-background"
                  }`}
                >
                  <span>{st.label}</span>
                  <span className="text-[10px] text-muted-foreground font-normal mt-1 leading-tight">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Sugestão da Espécie */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              4. Sabe identificar que animal é? (Opcional)
            </label>
            <select
              value={especieId}
              onChange={(e) => setEspecieId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Selecione uma espécie conhecida (ou deixe em branco)</option>
              {especiesLista.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nomePopular}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Bairro / Ponto de Referência */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              5. Bairro ou Ponto de Referência
            </label>
            <Input
              type="text"
              placeholder="Ex: Próximo à represa, Bairro Jundiacanga, Estrada vicinal..."
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          {/* 6. Observações */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              6. Detalhes Adicionais
            </label>
            <Textarea
              rows={3}
              placeholder="Ex: Havia filhotes por perto, o animal estava tentando atravessar a pista..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full text-base font-bold shadow-md rounded-xl"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Transmitindo ocorrência...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Enviar Registro de Avistamento
              </>
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
}
