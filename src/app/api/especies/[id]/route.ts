import { NextResponse } from "next/server";
import {
  getEspecieById,
  getOcorrenciasValidadasPorEspecie,
} from "@/lib/conteudo-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const especie = await getEspecieById(id);

    if (!especie) {
      return NextResponse.json(
        { error: `Espécie com ID '${id}' não encontrada.` },
        { status: 404 }
      );
    }

    const ocorrenciasValidadas = await getOcorrenciasValidadasPorEspecie(id);

    return NextResponse.json({
      especie,
      ocorrenciasValidadas,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar detalhes da espécie", details: error.message },
      { status: 500 }
    );
  }
}
