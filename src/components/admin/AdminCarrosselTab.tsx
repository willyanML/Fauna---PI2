"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, Check, AlertCircle, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaunaImage } from "@/components/fauna/FaunaImage";
import { type CarrosselItem } from "@/lib/conteudo-types";
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

interface AdminCarrosselTabProps {
  carrosselItens: CarrosselItem[];
  limiteMaximo: number;
  onSave: (limite: number, itens: CarrosselItem[]) => Promise<void>;
  saving: boolean;
}

export function AdminCarrosselTab({
  carrosselItens,
  limiteMaximo,
  onSave,
  saving,
}: AdminCarrosselTabProps) {
  const [itens, setItens] = useState<CarrosselItem[]>(carrosselItens);
  const [limite, setLimite] = useState<number>(limiteMaximo || 10);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

  // Sincroniza estado local quando as props do servidor atualizarem
  useEffect(() => {
    if (Array.isArray(carrosselItens) && carrosselItens.length > 0) {
      setItens(carrosselItens);
    }
  }, [carrosselItens]);

  useEffect(() => {
    if (limiteMaximo) {
      setLimite(limiteMaximo);
    }
  }, [limiteMaximo]);

  // Estado do Diálogo Shadcn de Exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState<CarrosselItem | null>(null);
  const [dialogExclusaoOpen, setDialogExclusaoOpen] = useState(false);
  const [deletando, setDeletando] = useState(false);

  // Estado do Modal de Nova Foto
  const [modalAberto, setModalAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoSubtitulo, setNovoSubtitulo] = useState("");
  const [novoGrupo, setNovoGrupo] = useState("MAMIFERO");
  const [novaFotoUrl, setNovaFotoUrl] = useState("");

  const itensAtivos = itens.filter((i) => i.ativo);

  const handleToggleAtivo = (id: string) => {
    const itemAtual = itens.find((i) => i.id === id);
    if (!itemAtual) return;

    // Se estiver desativando e já tiver 3 ou menos ativos, alerta o usuário
    if (itemAtual.ativo && itensAtivos.length <= 3) {
      setFeedback({
        tipo: "erro",
        msg: "Trava de segurança: O carrossel precisa manter no mínimo 3 fotos ativas para que a esteira funcione sem cortes.",
      });
      return;
    }

    const novosItens = itens.map((item) =>
      item.id === id ? { ...item, ativo: !item.ativo } : item
    );
    setItens(novosItens);
    setFeedback(null);
  };

  const handleSolicitarExclusao = (item: CarrosselItem) => {
    if (itens.length <= 3) {
      setFeedback({
        tipo: "erro",
        msg: "Não é possível excluir. O sistema exige pelo menos 3 imagens cadastradas para a esteira da Home.",
      });
      return;
    }
    setItemParaExcluir(item);
    setDialogExclusaoOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    setDeletando(true);
    try {
      const novos = itens.filter((i) => i.id !== itemParaExcluir.id);
      setItens(novos);
      await onSave(limite, novos);
      setFeedback({
        tipo: "sucesso",
        msg: `Mídia '${itemParaExcluir.titulo || (itemParaExcluir as any).nome}' excluída do carrossel e salva com sucesso!`,
      });
      setDialogExclusaoOpen(false);
      setItemParaExcluir(null);
    } catch (err: any) {
      setFeedback({
        tipo: "erro",
        msg: err.message || "Falha ao excluir item do carrossel.",
      });
    } finally {
      setDeletando(false);
    }
  };

  const handleAdicionarFoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaFotoUrl.trim()) {
      setFeedback({ tipo: "erro", msg: "Título e URL da imagem são obrigatórios." });
      return;
    }

    const novoItem: CarrosselItem = {
      id: `hero-${Date.now()}`,
      titulo: novoTitulo.trim(),
      subtitulo: novoSubtitulo.trim() || "Araçoiaba da Serra",
      grupo: novoGrupo,
      fotoUrl: novaFotoUrl.trim(),
      ativo: true,
    };

    setItens([novoItem, ...itens]);
    setNovoTitulo("");
    setNovoSubtitulo("");
    setNovaFotoUrl("");
    setModalAberto(false);
    setFeedback({ tipo: "sucesso", msg: "Nova foto adicionada à lista! Clique em 'Salvar Alterações' para publicar." });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1200, 900, 0.78);
      setNovaFotoUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNovaFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarTudo = async () => {
    try {
      setFeedback(null);
      await onSave(limite, itens);
      setFeedback({ tipo: "sucesso", msg: "Configurações do carrossel salvas com sucesso! A Home já foi atualizada." });
    } catch (err: any) {
      setFeedback({ tipo: "erro", msg: err.message || "Erro ao salvar carrossel." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Bloco de Configuração de Limite Máximo e Ações */}
      <Card className="p-6 rounded-3xl bg-white border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-forest-700" />
              Controle Dinâmico do Carrossel Hero
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Defina quantas imagens rodam simultaneamente na esteira panorâmica da página inicial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setModalAberto(true)}
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-xl border-forest-300 text-forest-800 hover:bg-forest-50"
            >
              <Plus className="w-4 h-4 mr-1 text-forest-700" />
              Adicionar Nova Foto
            </Button>

            <Button
              onClick={handleSalvarTudo}
              disabled={saving}
              className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs px-5"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {/* Ajuste do Limite Máximo */}
        <div className="bg-forest-50/70 border border-forest-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-forest-950">
              Limite Máximo de Fotos Ativas na Esteira
            </label>
            <span className="text-base font-extrabold text-forest-800 font-mono bg-white px-3 py-1 rounded-xl border border-forest-200 shadow-xs">
              {limite} fotos no máximo
            </span>
          </div>

          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="w-full accent-forest-700 cursor-pointer h-2 bg-forest-200 rounded-lg"
          />

          <div className="flex justify-between text-[11px] text-forest-800 font-medium pt-1">
            <span>Mínimo seguro: 3 fotos</span>
            <span>
              Exibindo atualmente: <strong>{Math.min(itensAtivos.length, limite)}</strong> fotos
            </span>
            <span>Máximo: 20 fotos</span>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {feedback && (
          <Alert variant={feedback.tipo === "sucesso" ? "default" : "destructive"} className="rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs font-semibold">
              {feedback.msg}
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Grid de Fotos Cadastradas no Carrossel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-gray-900">
            Mídias Cadastradas no Carrossel ({itens.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            {itensAtivos.length} ativas • {itens.length - itensAtivos.length} inativas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {itens.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden rounded-2xl transition border ${
                item.ativo
                  ? "bg-white border-gray-200 shadow-xs"
                  : "bg-gray-50 border-gray-200/60 opacity-60"
              }`}
            >
              <div className="h-40 relative bg-muted">
                <FaunaImage
                  src={item.fotoUrl || (item as any).imagemUrl}
                  alt={item.titulo || (item as any).nome || "Mídia do Carrossel"}
                  fallbackTitle={item.titulo || (item as any).nome}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className={`absolute top-2.5 left-2.5 text-[10px] font-bold border-0 shadow-xs ${
                    item.ativo ? "bg-forest-700 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {item.ativo ? "Ativa na Home" : "Pausada"}
                </Badge>
                <Badge className="absolute top-2.5 right-2.5 bg-black/70 text-white border-0 text-[10px]">
                  {item.grupo || "MAMIFERO"}
                </Badge>
              </div>

              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                    {item.titulo || (item as any).nome}
                  </h4>
                  <p className="text-xs text-muted-foreground italic line-clamp-1 font-serif">
                    {item.subtitulo || "Araçoiaba da Serra"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAtivo(item.id)}
                    className={`text-xs h-8 px-2.5 rounded-lg flex items-center gap-1.5 ${
                      item.ativo
                        ? "text-amber-800 hover:bg-amber-50"
                        : "text-forest-700 hover:bg-forest-50 font-bold"
                    }`}
                  >
                    {item.ativo ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Ativar
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSolicitarExclusao(item)}
                    className="text-xs h-8 px-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Excluir do carrossel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal / Diálogo para Adicionar Nova Foto */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Adicionar Nova Imagem ao Carrossel Hero
              </h3>
              <p className="text-xs text-muted-foreground">
                Informe a foto e identificação para integrar a esteira da Home.
              </p>
            </div>

            <form onSubmit={handleAdicionarFoto} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Título da Foto / Nome do Animal *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Capivara no Lago"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Subtítulo / Nome Científico
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Hydrochoerus hydrochaeris"
                  value={novoSubtitulo}
                  onChange={(e) => setNovoSubtitulo(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Grupo Taxonômico *
                </label>
                <select
                  value={novoGrupo}
                  onChange={(e) => setNovoGrupo(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input text-sm bg-background"
                >
                  <option value="MAMIFERO">Mamífero</option>
                  <option value="AVE">Ave</option>
                  <option value="REPTIL">Réptil</option>
                  <option value="ANFIBIO">Anfíbio</option>
                  <option value="INVERTEBRADO">Invertebrado</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800">
                  URL da Fotografia em Alta Resolução *
                </label>
                <Input
                  type="text"
                  placeholder="https://exemplo.com/foto.jpg ou /images/fauna/foto.jpg"
                  value={novaFotoUrl}
                  onChange={(e) => setNovaFotoUrl(e.target.value)}
                  className="rounded-xl"
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">ou envie um arquivo:</span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-forest-700 hover:text-forest-800 font-semibold bg-forest-50 hover:bg-forest-100 px-3 py-1.5 rounded-lg transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload local</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Pré-visualização */}
              {novaFotoUrl && (
                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-bold text-gray-600 block">Pré-visualização:</span>
                  <div className="h-36 rounded-xl overflow-hidden border border-gray-200 bg-muted">
                    <FaunaImage
                      src={novaFotoUrl}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

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
                  size="sm"
                  className="bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold px-4"
                >
                  Confirmar Adição
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo Shadcn UI de Confirmação de Exclusão da Mídia */}
      <AlertDialog open={dialogExclusaoOpen} onOpenChange={setDialogExclusaoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Mídia do Carrossel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong className="text-gray-900 font-semibold">
                "{itemParaExcluir?.titulo || (itemParaExcluir as any)?.nome}"
              </strong>{" "}
              do carrossel panorâmico da Home? Esta ação salvará a alteração de imediato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmarExclusao}
              disabled={deletando}
            >
              {deletando ? "Removendo..." : "Excluir do Carrossel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
