import { NextResponse } from "next/server";
import { resetParaPadrao } from "@/lib/conteudo-service";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const autenticado = await isAdminAuthenticated();
    if (!autenticado) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para restaurar dados padrão." },
        { status: 401 }
      );
    }

    const conteudoPadrao = await resetParaPadrao();
    return NextResponse.json({
      sucesso: true,
      mensagem: "Dados restaurados para os padrões originais com sucesso!",
      conteudo: conteudoPadrao,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao restaurar dados padrão", details: error.message },
      { status: 500 }
    );
  }
}
