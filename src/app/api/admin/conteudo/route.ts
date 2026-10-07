import { NextResponse } from "next/server";
import { getConteudo, updateCarrossel, getCarrosselHero } from "@/lib/conteudo-service";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conteudo = await getConteudo();
    const heroAtivos = await getCarrosselHero();

    const pendentesCount = conteudo.ocorrencias.filter(
      (o) => o.statusValidacao === "PENDENTE"
    ).length;

    const validadasCount = conteudo.ocorrencias.filter(
      (o) => o.statusValidacao === "VALIDADO" && o.aprovadoParaGaleria
    ).length;

    return NextResponse.json({
      carrossel: conteudo.carrossel,
      heroAtivos,
      stats: {
        totalEspecies: conteudo.especies.length,
        totalCarrosselItens: conteudo.carrossel.itens.length,
        totalCarrosselAtivos: heroAtivos.length,
        limiteMaximo: conteudo.carrossel.limiteMaximo,
        ocorrenciasPendentes: pendentesCount,
        ocorrenciasValidadas: validadasCount,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar conteúdo do admin:", error);
    return NextResponse.json(
      { error: "Falha ao carregar dados do painel admin", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const autenticado = await isAdminAuthenticated();
    if (!autenticado) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para realizar alterações." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { limiteMaximo, itens } = body;

    if (!Array.isArray(itens)) {
      return NextResponse.json(
        { error: "A lista de itens do carrossel é obrigatória." },
        { status: 400 }
      );
    }

    const carrosselAtualizado = await updateCarrossel(
      Number(limiteMaximo) || 10,
      itens
    );

    return NextResponse.json({
      sucesso: true,
      carrossel: carrosselAtualizado,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar carrossel:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao salvar configurações do carrossel." },
      { status: 400 }
    );
  }
}
