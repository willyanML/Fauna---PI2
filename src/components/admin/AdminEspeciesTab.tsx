"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, AlertCircle, Check, Upload, PawPrint, Eye, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaunaImage } from "@/components/fauna/FaunaImage";
import { type EspecieData, validarEspecie } from "@/lib/conteudo-types";
import { correspondeBusca } from "@/lib/utils";
import { compressImage } from "@/lib/image-utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AdminEspeciesTabProps {
  especies: EspecieData[];
  onSalvarEspecie: (dados: Partial<EspecieData>, editId?: string) => Promise<void>;
  onExcluirEspecie: (id: string) => Promise<void>;
  saving: boolean;
}

export function AdminEspeciesTab({
  especies,
  onSalvarEspecie,
  onExcluirEspecie,
  saving,
}: AdminEspeciesTabProps) {
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [especieEmEdicao, setEspecieEmEdicao] = useState<EspecieData | null>(null);
  const [imagemAmpliadaUrl, setImagemAmpliadaUrl] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

  // Estado do Diálogo Shadcn UI de Confirmação de Exclusão
  const [especieParaExcluir, setEspecieParaExcluir] = useState<EspecieData | null>(null);
  const [dialogExclusaoOpen, setDialogExclusaoOpen] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Campos do Formulário
  const [nomePopular, setNomePopular] = useState("");
  const [nomeCientifico, setNomeCientifico] = useState("");
  const [grupo, setGrupo] = useState<EspecieData["grupo"]>("MAMIFERO");
  const [statusConservacao, setStatusConservacao] = useState<EspecieData["statusConservacao"]>("LC");
  const [fotoReferenciaUrl, setFotoReferenciaUrl] = useState("");
  const [descricao, setDescricao] = useState("");
  const [habitat, setHabitat] = useState("");
  const [orientacoesConvivencia, setOrientacoesConvivencia] = useState("");
  const [ameacadaExtincao, setAmeacadaExtincao] = useState(false);
  const [exibirNoCarrosselHome, setExibirNoCarrosselHome] = useState(true);

  const abrirModalNovo = () => {
    setEspecieEmEdicao(null);
    setNomePopular("");
    setNomeCientifico("");
    setGrupo("MAMIFERO");
    setStatusConservacao("LC");
    setFotoReferenciaUrl("");
    setDescricao("");
    setHabitat("");
    setOrientacoesConvivencia("");
    setAmeacadaExtincao(false);
    setExibirNoCarrosselHome(true);
    setErrosValidacao([]);
    setModalAberto(true);
  };

  const abrirModalEditar = (esp: EspecieData) => {
    setEspecieEmEdicao(esp);
    setNomePopular(esp.nomePopular);
    setNomeCientifico(esp.nomeCientifico);
    setGrupo(esp.grupo);
    setStatusConservacao(esp.statusConservacao);
    setFotoReferenciaUrl(esp.fotoReferenciaUrl);
    setDescricao(esp.descricao);
    setHabitat(esp.habitat);
    setOrientacoesConvivencia(esp.orientacoesConvivencia);
    setAmeacadaExtincao(esp.ameacadaExtincao);
    setExibirNoCarrosselHome(esp.exibirNoCarrosselHome ?? true);
    setErrosValidacao([]);
    setModalAberto(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1200, 900, 0.78);
      setFotoReferenciaUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFotoReferenciaUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrosValidacao([]);
    setFeedback(null);

    const dados: Partial<EspecieData> = {
      nomePopular: nomePopular.trim(),
      nomeCientifico: nomeCientifico.trim(),
      grupo,
      statusConservacao,
      fotoReferenciaUrl: fotoReferenciaUrl.trim(),
      descricao: descricao.trim(),
      habitat: habitat.trim(),
      orientacoesConvivencia: orientacoesConvivencia.trim(),
      ameacadaExtincao,
      exibirNoCarrosselHome,
    };

    const validacao = validarEspecie(dados);
    if (!validacao.valido) {
      setErrosValidacao(validacao.erros);
      return;
    }

    try {
      await onSalvarEspecie(dados, especieEmEdicao?.id);
      setModalAberto(false);
      setFeedback({
        tipo: "sucesso",
        msg: especieEmEdicao
          ? `Espécie '${nomePopular}' atualizada com sucesso!`
          : `Nova espécie '${nomePopular}' cadastrada com sucesso!`,
      });
    } catch (err: any) {
      setFeedback({ tipo: "erro", msg: err.message || "Erro ao salvar espécie." });
    }
  };

  const handleSolicitarExclusao = (esp: EspecieData) => {
    setEspecieParaExcluir(esp);
    setDialogExclusaoOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!especieParaExcluir) return;
    setExcluindo(true);
    try {
      await onExcluirEspecie(especieParaExcluir.id);
      setFeedback({
        tipo: "sucesso",
        msg: `Espécie '${especieParaExcluir.nomePopular}' excluída com sucesso do catálogo e desvinculada das ocorrências.`,
      });
      setDialogExclusaoOpen(false);
      setEspecieParaExcluir(null);
    } catch (err: any) {
      setFeedback({
        tipo: "erro",
        msg: err.message || "Falha ao excluir espécie.",
      });
    } finally {
      setExcluindo(false);
    }
  };

  const especiesFiltradas = especies.filter(
    (e) =>
      correspondeBusca(e.nomePopular, busca) ||
      correspondeBusca(e.nomeCientifico, busca) ||
      correspondeBusca(e.grupo, busca) ||
      correspondeBusca(e.habitat, busca)
  );

  return (
    <div className="space-y-6">
      {/* Barra de Busca e Ação de Nova Espécie */}
      <Card className="p-6 rounded-3xl bg-white border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-forest-700" />
              Catálogo de Espécies Biológicas
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie a fauna nativa de Araçoiaba da Serra. Todos os cadastros seguem padrão com 10 campos obrigatórios.
            </p>
          </div>

          <Button
            onClick={abrirModalNovo}
            className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs px-4 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Espécie
          </Button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome popular, científico ou grupo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-11 bg-muted/20 border-gray-200 rounded-xl text-sm"
          />
        </div>

        {feedback && (
          <Alert variant={feedback.tipo === "sucesso" ? "default" : "destructive"} className="rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs font-semibold">{feedback.msg}</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Grid de Espécies Cadastradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {especiesFiltradas.map((esp) => (
          <Card key={esp.id} className="overflow-hidden rounded-2xl bg-white border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="h-44 relative bg-muted">
                <FaunaImage
                  src={esp.fotoReferenciaUrl}
                  alt={esp.nomePopular}
                  fallbackTitle={esp.nomePopular}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <Badge className="bg-black/75 text-white border-0 text-[10px]">
                    {esp.grupo}
                  </Badge>
                  {esp.ameacadaExtincao && (
                    <Badge className="bg-amber-600 text-white border-0 text-[10px] font-bold">
                      Ameaçada ({esp.statusConservacao})
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900 line-clamp-1">{esp.nomePopular}</h3>
                  <p className="text-xs text-muted-foreground italic font-serif">{esp.nomeCientifico}</p>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{esp.descricao}</p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between">
              <a
                href={`/especies/${esp.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-forest-700 hover:text-forest-800 font-semibold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver Página
              </a>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => abrirModalEditar(esp)}
                  className="text-xs h-8 px-2.5 text-gray-700 rounded-lg hover:bg-forest-50 hover:text-forest-800"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Editar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSolicitarExclusao(esp)}
                  className="text-xs h-8 px-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Excluir espécie"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal / Diálogo para Criação e Edição com 10 Campos Obrigatórios */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] m-0 !m-0 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAberto(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 my-8">
            <div className="border-b border-gray-100 pb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {especieEmEdicao ? `Editar Espécie: ${especieEmEdicao.nomePopular}` : "Cadastrar Nova Espécie Biológica"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Preencha os 10 campos obrigatórios com informações taxonômicas e biológicas rigorosas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0"
                title="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alertas de Validação */}
            {errosValidacao.length > 0 && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs space-y-1">
                  <p className="font-bold">Por favor, corrija os seguintes campos:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {errosValidacao.map((erro, idx) => (
                      <li key={idx}>{erro}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">1. Nome Popular *</label>
                  <Input
                    type="text"
                    placeholder="Ex: Lobo-guará"
                    value={nomePopular}
                    onChange={(e) => setNomePopular(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Nome comum pelo qual a comunidade reconhece a espécie (mín. 2 letras).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">2. Nome Científico *</label>
                  <Input
                    type="text"
                    placeholder="Ex: Chrysocyon brachyurus"
                    value={nomeCientifico}
                    onChange={(e) => setNomeCientifico(e.target.value)}
                    required
                    className="rounded-xl font-serif italic"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Nomenclatura taxonômica binomial em latim (mín. 4 letras).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">3. Grupo Biológico *</label>
                  <select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input text-sm bg-background"
                  >
                    <option value="MAMIFERO">Mamífero</option>
                    <option value="AVE">Ave</option>
                    <option value="REPTIL">Réptil</option>
                    <option value="ANFIBIO">Anfíbio</option>
                    <option value="INVERTEBRADO">Invertebrado</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Classe zoológica principal para filtros do catálogo e avistamentos.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">4. Status IUCN *</label>
                  <select
                    value={statusConservacao}
                    onChange={(e) => setStatusConservacao(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input text-sm bg-background"
                  >
                    <option value="LC">LC - Menor Preocupação</option>
                    <option value="NT">NT - Quase Ameaçada</option>
                    <option value="VU">VU - Vulnerável</option>
                    <option value="EN">EN - Em Perigo</option>
                    <option value="CR">CR - Criticamente em Perigo</option>
                    <option value="DD">DD - Dados Deficientes</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Classificação oficial de conservação da espécie (Lista Vermelha IUCN).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800">5. Foto de Referência Oficial *</label>
                <Input
                  type="text"
                  placeholder="/images/fauna/nome-da-especie.jpg ou https://..."
                  value={fotoReferenciaUrl}
                  onChange={(e) => setFotoReferenciaUrl(e.target.value)}
                  className="rounded-xl"
                  required
                />
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-muted-foreground">ou selecione arquivo:</span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-forest-700 bg-forest-50 hover:bg-forest-100 px-3 py-1.5 rounded-lg transition font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload de imagem</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Caminho local (/images/fauna/...), URL direta da web ou upload de arquivo do seu dispositivo.
                </p>

                {fotoReferenciaUrl && (
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Prévia da Fotografia:</span>
                      <button
                        type="button"
                        onClick={() => setImagemAmpliadaUrl(fotoReferenciaUrl)}
                        className="text-forest-700 hover:text-forest-800 flex items-center gap-1 font-semibold hover:underline"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Ampliar foto
                      </button>
                    </div>
                    <div
                      onClick={() => setImagemAmpliadaUrl(fotoReferenciaUrl)}
                      className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-gray-200 bg-forest-950/5 group cursor-pointer shadow-xs hover:border-forest-400 transition"
                      title="Clique para ampliar a imagem"
                    >
                      <FaunaImage
                        src={fotoReferenciaUrl}
                        alt="Prévia de referência"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium text-xs backdrop-blur-[1px]">
                        <Maximize2 className="w-4 h-4" />
                        Clique para ver ampliado em alta resolução
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">6. Descrição Biológica * (mín. 20 caracteres)</label>
                <Textarea
                  placeholder="Descreva hábitos alimentares, porte físico e comportamento ecológico..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  rows={2}
                  className="rounded-xl text-xs"
                />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Mínimo de 20 caracteres. Detalhe porte físico, dieta e hábitos diurnos ou noturnos.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">7. Habitat Natural *</label>
                <Input
                  type="text"
                  placeholder="Ex: Matas de galeria, bordas de fragmentos e áreas abertas"
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Ambientes preferenciais da espécie em Araçoiaba da Serra (ex: matas ciliares, campos abertos).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">8. Orientações de Convivência Comunitária *</label>
                <Textarea
                  placeholder="Orientações aos munícipes: manter distância, não tentar captura, etc..."
                  value={orientacoesConvivencia}
                  onChange={(e) => setOrientacoesConvivencia(e.target.value)}
                  required
                  rows={2}
                  className="rounded-xl text-xs"
                />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Mínimo de 10 caracteres. Boas práticas para o cidadão: manter distância, não alimentar e acionar resgate se ferido.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-3 bg-muted/30 border border-gray-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ameacadaExtincao}
                      onChange={(e) => setAmeacadaExtincao(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                    <span className="text-xs font-bold text-gray-800">9. Espécie Ameaçada de Extinção</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground leading-tight px-1">
                    Exibe selo de alerta nas listagens públicas e relatórios ambientais.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-3 bg-muted/30 border border-gray-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exibirNoCarrosselHome}
                      onChange={(e) => setExibirNoCarrosselHome(e.target.checked)}
                      className="w-4 h-4 accent-forest-700 rounded"
                    />
                    <span className="text-xs font-bold text-gray-800">10. Exibir na Esteira da Home</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground leading-tight px-1">
                    Habilita esta espécie no carrossel de fotos dinâmico da página inicial.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold px-5"
                >
                  {saving ? "Salvando..." : especieEmEdicao ? "Atualizar Espécie" : "Cadastrar Espécie"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lightbox de Imagem Ampliada (Fecha ao clicar fora ou no botão) */}
      {imagemAmpliadaUrl && (
        <div
          className="fixed inset-0 z-[150] m-0 !m-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setImagemAmpliadaUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-forest-400" />
                <span className="text-sm font-bold truncate">
                  {nomePopular ? `${nomePopular} (${nomeCientifico || "Fotografia de Referência"})` : "Visualização de Imagem em Alta Resolução"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImagemAmpliadaUrl(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs px-3"
                title="Fechar visualização"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/10 p-2">
              <img
                src={imagemAmpliadaUrl}
                alt="Imagem ampliada"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
            <p className="text-[11px] text-gray-400 pt-2 text-center">
              Clique fora da foto ou no botão Fechar para retornar ao formulário
            </p>
          </div>
        </div>
      )}

      {/* Diálogo Shadcn UI de Confirmação de Exclusão de Espécie */}
      <AlertDialog open={dialogExclusaoOpen} onOpenChange={setDialogExclusaoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Espécie do Catálogo</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir a espécie{" "}
              <strong className="text-gray-900 font-semibold">
                "{especieParaExcluir?.nomePopular}"
              </strong>{" "}
              (<em>{especieParaExcluir?.nomeCientifico}</em>)? Todas as ocorrências associadas serão desvinculadas com segurança e ela será removida do catálogo público e do carrossel da Home.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmarExclusao}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir Espécie"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
