import { NextResponse } from "next/server";
import { getOcorrencias, moderarOcorrencia } from "@/lib/conteudo-service";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let ocorrencias = await getOcorrencias();

    if (status && ["PENDENTE", "VALIDADO", "REJEITADO"].includes(status.toUpperCase())) {
      ocorrencias = ocorrencias.filter(
        (o) => o.statusValidacao === status.toUpperCase()
      );
    }

    return NextResponse.json(ocorrencias);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao listar ocorrências", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const autenticado = await isAdminAuthenticated();
    if (!autenticado) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para moderar ocorrências." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, statusValidacao, aprovadoParaGaleria, especieSugeridaId } = body;

    if (!id || !statusValidacao) {
      return NextResponse.json(
        { error: "Os campos 'id' e 'statusValidacao' são obrigatórios." },
        { status: 400 }
      );
    }

    const ocorrenciaAtualizada = await moderarOcorrencia(id, {
      statusValidacao,
      aprovadoParaGaleria,
      especieSugeridaId,
    });

    return NextResponse.json({
      sucesso: true,
      ocorrencia: ocorrenciaAtualizada,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao moderar ocorrência." },
      { status: 400 }
    );
  }
}
