import { NextResponse } from "next/server";
import { getEspecies } from "@/lib/conteudo-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const especies = await getEspecies();
    return NextResponse.json(especies, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao obter catálogo de espécies" },
      { status: 500 }
    );
  }
}
