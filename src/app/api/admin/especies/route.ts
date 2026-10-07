import { NextResponse } from "next/server";
import {
  getEspecies,
  createEspecie,
  updateEspecie,
  deleteEspecie,
} from "@/lib/conteudo-service";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const especies = await getEspecies();
    return NextResponse.json(especies);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao buscar espécies", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const autenticado = await isAdminAuthenticated();
    if (!autenticado) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para cadastrar espécies." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const novaEspecie = await createEspecie(body);

    return NextResponse.json({
      sucesso: true,
      especie: novaEspecie,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro na validação da espécie." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const autenticado = await isAdminAuthenticated();
    if (!autenticado) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para alterar espécies." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...dados } = body;

    if (!id) {
      return NextResponse.json(
        { error: "O ID da espécie é obrigatório para atualização." },
        { status: 400 }
      );
    }

    const especieAtualizada = await updateEspecie(id, dados);

    return NextResponse.json({
      sucesso: true,
      especie: especieAtualizada,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar espécie." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const autenticado = await isAdminAuthenticated();
    if (!autenticado) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para excluir espécies." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // body opcional
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "O ID da espécie é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    const removido = await deleteEspecie(id);

    if (!removido) {
      return NextResponse.json(
        { error: `Espécie com ID '${id}' não encontrada.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Espécie removida com sucesso e referências tratadas.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Falha ao excluir espécie." },
      { status: 400 }
    );
  }
}
