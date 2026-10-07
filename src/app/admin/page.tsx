"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminCarrosselTab } from "@/components/admin/AdminCarrosselTab";
import { AdminEspeciesTab } from "@/components/admin/AdminEspeciesTab";
import { AdminCuradoriaTab } from "@/components/admin/AdminCuradoriaTab";
import { type CarrosselItem, type EspecieData, type OcorrenciaData } from "@/lib/conteudo-types";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("especies");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

  // Estados de dados
  const [stats, setStats] = useState({
    totalEspecies: 0,
    totalCarrosselItens: 0,
    totalCarrosselAtivos: 0,
    limiteMaximo: 10,
    ocorrenciasPendentes: 0,
    ocorrenciasValidadas: 0,
  });
  const [carrosselItens, setCarrosselItens] = useState<CarrosselItem[]>([]);
  const [especies, setEspecies] = useState<EspecieData[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaData[]>([]);

  // Carrega todos os dados do painel admin
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resConteudo, resEspecies, resOcorr] = await Promise.all([
        fetch("/api/admin/conteudo"),
        fetch("/api/admin/especies"),
        fetch("/api/admin/ocorrencias"),
      ]);

      const dataConteudo = await resConteudo.json();
      const dataEspecies = await resEspecies.json();
      const dataOcorr = await resOcorr.json();

      if (dataConteudo.carrossel) {
        setCarrosselItens(dataConteudo.carrossel.itens || []);
        setStats(dataConteudo.stats);
      }
      if (Array.isArray(dataEspecies)) {
        setEspecies(dataEspecies);
      }
      if (Array.isArray(dataOcorr)) {
        setOcorrencias(dataOcorr);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do painel administrativo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verifica a sessão administrativa no carregamento
  const verificarSessaoECarregar = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/auth/session");
      const data = await res.json();

      if (data.autenticado) {
        setAutenticado(true);
        await carregarDados();
      } else {
        setAutenticado(false);
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro ao verificar sessão administrativa:", err);
      setAutenticado(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    verificarSessaoECarregar();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setAutenticado(false);
    }
  };

  // Salvar carrossel
  const handleSaveCarrossel = async (limite: number, itens: CarrosselItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/conteudo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limiteMaximo: limite, itens }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await carregarDados();
    } finally {
      setSaving(false);
    }
  };

  // Salvar ou Criar Espécie
  const handleSalvarEspecie = async (dados: Partial<EspecieData>, editId?: string) => {
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const payload = editId ? { id: editId, ...dados } : dados;

      const res = await fetch("/api/admin/especies", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await carregarDados();
    } finally {
      setSaving(false);
    }
  };

  // Excluir Espécie
  const handleExcluirEspecie = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/especies?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await carregarDados();
    } finally {
      setSaving(false);
    }
  };

  // Moderar Ocorrência
  const handleModerarOcorrencia = async (
    id: string,
    status: "VALIDADO" | "REJEITADO",
    especieId?: string | null
  ) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ocorrencias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          statusValidacao: status,
          aprovadoParaGaleria: status === "VALIDADO",
          especieSugeridaId: especieId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await carregarDados();
    } finally {
      setSaving(false);
    }
  };

  // Restaurar dados originais de fábrica via AlertDialog do Shadcn
  const handleSolicitarReset = () => {
    setConfirmResetOpen(true);
  };

  const handleConfirmarReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await carregarDados();
      setResetFeedback({
        tipo: "sucesso",
        msg: "Configurações e dados originais de fábrica restaurados com sucesso!",
      });
      setConfirmResetOpen(false);
    } catch (err: any) {
      setResetFeedback({
        tipo: "erro",
        msg: `Falha ao restaurar dados: ${err.message}`,
      });
    } finally {
      setResetting(false);
    }
  };

  if (autenticado === null || (loading && autenticado === true)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-sm font-semibold tracking-wide">
          {autenticado === null ? "Verificando credenciais..." : "Carregando painel de controle e gestão..."}
        </p>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <AdminLoginForm
        onLoginSuccess={() => {
          setAutenticado(true);
          carregarDados();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Lateral Moderna (Desktop fixa + Mobile gaveta) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onReset={handleSolicitarReset}
        resetting={resetting}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Slim do Admin */}
        <AdminTopbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          saving={saving}
          onLogout={handleLogout}
        />

        {/* Área de Trabalho Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Feedback de Reset se houver */}
          {resetFeedback && (
            <Alert
              variant={resetFeedback.tipo === "sucesso" ? "default" : "destructive"}
              className="rounded-2xl bg-white shadow-xs"
            >
              <AlertDescription className="text-xs font-semibold flex items-center justify-between">
                <span>{resetFeedback.msg}</span>
                <button
                  type="button"
                  onClick={() => setResetFeedback(null)}
                  className="text-xs text-muted-foreground hover:text-gray-900 underline ml-4"
                >
                  Dispensar
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Cards de Métricas e Indicadores */}
          <AdminStatsCards stats={stats} />

          {/* Módulo Selecionado na Sidebar */}
          {activeTab === "especies" && (
            <AdminEspeciesTab
              especies={especies}
              onSalvarEspecie={handleSalvarEspecie}
              onExcluirEspecie={handleExcluirEspecie}
              saving={saving}
            />
          )}

          {activeTab === "carrossel" && (
            <AdminCarrosselTab
              carrosselItens={carrosselItens}
              limiteMaximo={stats.limiteMaximo}
              onSave={handleSaveCarrossel}
              saving={saving}
            />
          )}

          {activeTab === "curadoria" && (
            <AdminCuradoriaTab
              ocorrencias={ocorrencias}
              especies={especies}
              onModerar={handleModerarOcorrencia}
              moderating={saving}
            />
          )}
        </main>
      </div>

      {/* Diálogo Shadcn UI de Confirmação de Reset de Fábrica */}
      <AlertDialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Dados Originais de Fábrica</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar as espécies, carrossel e imagens originais de fábrica de Araçoiaba da Serra? Quaisquer alterações locais manuais serão redefinidas para o catálogo padrão calibrado do município.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmarReset}
              disabled={resetting}
            >
              {resetting ? "Restaurando..." : "Sim, Restaurar Padrões"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
