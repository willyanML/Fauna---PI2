export interface CarrosselItem {
  id: string;
  titulo: string;
  subtitulo: string;
  grupo: string;
  fotoUrl: string;
  ativo: boolean;
}

export interface CarrosselConfig {
  limiteMaximo: number;
  itens: CarrosselItem[];
}

export interface EspecieData {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  grupo: "MAMIFERO" | "AVE" | "REPTIL" | "ANFIBIO" | "INVERTEBRADO" | "OUTRO";
  statusConservacao: "LC" | "NT" | "VU" | "EN" | "CR" | "DD";
  descricao: string;
  habitat: string;
  orientacoesConvivencia: string;
  fotoReferenciaUrl: string;
  ameacadaExtincao: boolean;
  exibirNoCarrosselHome?: boolean;
}

export interface OcorrenciaData {
  id: string;
  protocolo: string;
  especieSugeridaId: string | null;
  bairroAreaVerde: string;
  latitude: number;
  longitude: number;
  statusAnimal: string;
  statusValidacao: "PENDENTE" | "VALIDADO" | "REJEITADO";
  aprovadoParaGaleria: boolean;
  dataHoraAvistamento: string;
  observacoes?: string;
  fotoUrl?: string;
}

export interface ConteudoFauna {
  carrossel: CarrosselConfig;
  especies: EspecieData[];
  ocorrencias: OcorrenciaData[];
}

/**
 * Validação rigorosa dos 10 campos obrigatórios de uma espécie
 */
export function validarEspecie(dados: Partial<EspecieData>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (!dados.nomePopular || dados.nomePopular.trim().length < 2) {
    erros.push("1. Nome popular é obrigatório (mínimo de 2 caracteres).");
  }
  if (!dados.nomeCientifico || dados.nomeCientifico.trim().length < 4) {
    erros.push("2. Nome científico é obrigatório (mínimo de 4 caracteres, formato binomial).");
  }
  const gruposValidos = ["MAMIFERO", "AVE", "REPTIL", "ANFIBIO", "INVERTEBRADO", "OUTRO"];
  if (!dados.grupo || !gruposValidos.includes(dados.grupo)) {
    erros.push("3. Grupo biológico é obrigatório (MAMIFERO, AVE, REPTIL, ANFIBIO, INVERTEBRADO, OUTRO).");
  }
  const statusValidos = ["LC", "NT", "VU", "EN", "CR", "DD"];
  if (!dados.statusConservacao || !statusValidos.includes(dados.statusConservacao)) {
    erros.push("4. Status de conservação IUCN é obrigatório (LC, NT, VU, EN, CR, DD).");
  }
  if (!dados.fotoReferenciaUrl || (!dados.fotoReferenciaUrl.startsWith("http") && !dados.fotoReferenciaUrl.startsWith("data:image"))) {
    erros.push("5. Foto de referência é obrigatória (informe uma URL válida ou envie arquivo).");
  }
  if (!dados.descricao || dados.descricao.trim().length < 20) {
    erros.push("6. Descrição biológica é obrigatória (mínimo de 20 caracteres detalhando hábitos).");
  }
  if (!dados.habitat || dados.habitat.trim().length < 3) {
    erros.push("7. Habitat natural é obrigatório (ex: Margens de rios, cerrado, copas de árvores).");
  }
  if (!dados.orientacoesConvivencia || dados.orientacoesConvivencia.trim().length < 10) {
    erros.push("8. Orientações de convivência para a população são obrigatórias (mínimo 10 caracteres).");
  }
  if (typeof dados.ameacadaExtincao !== "boolean") {
    erros.push("9. Sinalização de espécie ameaçada é obrigatória (Sim ou Não).");
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}
