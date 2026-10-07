import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusAnimal, StatusValidacao } from "@prisma/client";
import { addOcorrencia } from "@/lib/conteudo-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ocorrencias = await prisma.ocorrencia.findMany({
      include: {
        especieSugerida: true,
        midias: true,
      },
      orderBy: { dataHoraAvistamento: "desc" },
    });
    return NextResponse.json(ocorrencias);
  } catch (error) {
    console.error("Erro ao buscar ocorrências no banco:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      latitude,
      longitude,
      precisaoGpsMetros,
      statusAnimal,
      especieSugeridaId,
      bairroAreaVerde,
      observacoes,
      fotoBase64,
    } = body;

    // Salva na camada persistente de conteúdo para disponibilidade imediata no painel admin
    const novaOcorr = await addOcorrencia({
      latitude: Number(latitude) || -23.5186,
      longitude: Number(longitude) || -47.6138,
      bairroAreaVerde: bairroAreaVerde || "Araçoiaba da Serra",
      statusAnimal: statusAnimal || "SAUDAVEL",
      especieSugeridaId: especieSugeridaId || null,
      observacoes: observacoes || undefined,
      fotoUrl: fotoBase64 || undefined,
    });

    // Se o banco PostgreSQL estiver ativo, salva também no Prisma
    try {
      const ocorrencia = await prisma.ocorrencia.create({
        data: {
          protocolo: novaOcorr.protocolo,
          latitude: Number(latitude),
          longitude: Number(longitude),
          precisaoGpsMetros: precisaoGpsMetros ? Number(precisaoGpsMetros) : null,
          bairroAreaVerde: bairroAreaVerde || "Araçoiaba da Serra",
          statusAnimal: (statusAnimal as StatusAnimal) || StatusAnimal.SAUDAVEL,
          dataHoraAvistamento: new Date(),
          observacoes: observacoes || null,
          especieSugeridaId: especieSugeridaId || null,
          statusValidacao: StatusValidacao.PENDENTE,
        },
      });

      if (fotoBase64) {
        await prisma.ocorrenciaMidia.create({
          data: {
            ocorrenciaId: ocorrencia.id,
            tipo: "FOTO",
            urlOriginal: fotoBase64,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Banco Prisma não acessível no momento, salvo no armazenamento JSON:", dbErr);
    }

    return NextResponse.json({
      sucesso: true,
      protocolo: novaOcorr.protocolo,
      id: novaOcorr.id,
    });
  } catch (error) {
    console.error("Erro no processamento da ocorrência:", error);
    return NextResponse.json(
      { error: "Falha ao processar ocorrência" },
      { status: 500 }
    );
  }
}
