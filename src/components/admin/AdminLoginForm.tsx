"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaunaLogo } from "@/components/ui/FaunaLogo";

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!usuario.trim() || !senha) {
      setErro("Por favor, preencha o usuário e a senha.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuario.trim(),
          senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciais inválidas.");
      }

      // Login bem-sucedido
      onLoginSuccess();
    } catch (err: any) {
      setErro(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-forest-950 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Top header branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/10 mb-2">
            <FaunaLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fauna da Serra
          </h1>
          <p className="text-sm text-emerald-200/80">
            Painel Administrativo & Curadoria Biológica
          </p>
        </div>

        {/* Card de Login */}
        <Card className="border-gray-800 bg-white shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">
                Acesso Restrito
              </CardTitle>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                Admin
              </span>
            </div>
            <CardDescription className="text-xs text-gray-500">
              Digite seu usuário e senha institucional para gerenciar espécies e mídias.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <Alert className="border-rose-200 bg-rose-50 text-rose-800 py-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <AlertDescription className="text-xs font-semibold">
                    {erro}
                  </AlertDescription>
                </Alert>
              )}

              {/* Campo Usuário (NÃO e-mail) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="usuario"
                  className="block text-xs font-bold text-gray-700"
                >
                  Usuário de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="usuario"
                    name="usuario"
                    type="text"
                    autoComplete="username"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="ex: faunadaserra"
                    className="pl-10 h-11 rounded-xl text-sm border-gray-200 focus-visible:ring-forest-600"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="senha"
                    className="block text-xs font-bold text-gray-700"
                  >
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 h-11 rounded-xl text-sm border-gray-200 focus-visible:ring-forest-600"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Envio */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold text-sm shadow-md transition"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>Entrar no Painel</span>
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-0 border-t border-gray-100 bg-gray-50/50 p-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500 hover:text-gray-900"
            >
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Voltar ao Portal Público</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Rodapé institucional */}
        <p className="text-center text-xs text-emerald-300/60">
          Iniciativa de Ciência Cidadã • Polo Araçoiaba da Serra • UNIVESP PI2
        </p>
      </div>
    </div>
  );
}
