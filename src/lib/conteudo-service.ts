import fs from "fs";
import path from "path";
import {
  type CarrosselItem,
  type CarrosselConfig,
  type EspecieData,
  type OcorrenciaData,
  type ConteudoFauna,
  validarEspecie,
} from "./conteudo-types";
import { isMongoConfigured, getMongoDb } from "./mongodb";

export * from "./conteudo-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DATA_FILE = path.join(DATA_DIR, "conteudo_fauna.json");

/**
 * Lê os dados do MongoDB Atlas se configurado, com auto-seed inicial
 */
async function getConteudoFromMongo(): Promise<ConteudoFauna | null> {
  if (!isMongoConfigured()) return null;
  try {
    const db = await getMongoDb();
    const count = await db.collection("especies").countDocuments();

    // Auto-seed se o banco estiver vazio na primeira inicialização
    if (count === 0) {
      let dadosIniciais: ConteudoFauna;
      try {
        if (fs.existsSync(DATA_FILE)) {
          const raw = await fs.promises.readFile(DATA_FILE, "utf-8");
          dadosIniciais = JSON.parse(raw);
        } else {
          dadosIniciais = gerarDadosPadrao();
        }
      } catch {
        dadosIniciais = gerarDadosPadrao();
      }

      await saveConteudoToMongo(dadosIniciais);
      return dadosIniciais;
    }

    const [especiesDocs, carrosselDoc, ocorrenciasDocs] = await Promise.all([
      db.collection("especies").find().toArray(),
      db.collection("carrossel").findOne({ _id: "config" as any }),
      db.collection("ocorrencias").find().toArray(),
    ]);

    const especies: EspecieData[] = especiesDocs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { id: doc.id || _id?.toString(), ...rest };
    });

    const ocorrencias: OcorrenciaData[] = ocorrenciasDocs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { id: doc.id || _id?.toString(), ...rest };
    });

    const carrossel: CarrosselConfig = {
      limiteMaximo: carrosselDoc?.limiteMaximo || 10,
      itens: Array.isArray(carrosselDoc?.itens)
        ? carrosselDoc.itens.map((it: any) => ({
            id: it.id || `item-${Date.now()}`,
            titulo: it.titulo || it.nome || "Espécie Silvestre",
            subtitulo: it.subtitulo || "",
            grupo: it.grupo || "MAMIFERO",
            fotoUrl: it.fotoUrl || it.imagemUrl || "/images/fauna/capivara.jpg",
            ativo: it.ativo !== undefined ? Boolean(it.ativo) : true,
          }))
        : [],
    };

    return {
      carrossel,
      especies,
      ocorrencias,
    };
  } catch (err) {
    console.warn("[MongoDB] Conexão falhou, utilizando fallback local em arquivo:", err);
    return null;
  }
}

/**
 * Salva os dados no MongoDB Atlas
 */
async function saveConteudoToMongo(conteudo: ConteudoFauna): Promise<boolean> {
  if (!isMongoConfigured()) return false;
  try {
    const db = await getMongoDb();

    // Salva carrossel
    await db.collection("carrossel").updateOne(
      { _id: "config" as any },
      {
        $set: {
          limiteMaximo: conteudo.carrossel.limiteMaximo,
          itens: conteudo.carrossel.itens,
          atualizadoEm: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    // Salva espécies com ID fixo
    await db.collection("especies").deleteMany({});
    if (conteudo.especies.length > 0) {
      const especiesLimpo = conteudo.especies.map((e) => {
        const doc: any = { ...e, _id: e.id };
        return doc;
      });
      await db.collection("especies").insertMany(especiesLimpo);
    }

    // Salva ocorrências com ID fixo
    await db.collection("ocorrencias").deleteMany({});
    if (conteudo.ocorrencias.length > 0) {
      const ocorrenciasLimpo = conteudo.ocorrencias.map((o) => {
        const doc: any = { ...o, _id: o.id };
        return doc;
      });
      await db.collection("ocorrencias").insertMany(ocorrenciasLimpo);
    }

    return true;
  } catch (err) {
    console.error("[MongoDB] Erro ao gravar dados no MongoDB Atlas:", err);
    return false;
  }
}

/**
 * Lê o arquivo JSON ou banco MongoDB com recuperação automática e cache
 */
export async function getConteudo(): Promise<ConteudoFauna> {
  // 1. Tenta buscar do MongoDB se configurado
  if (isMongoConfigured()) {
    const mongoData = await getConteudoFromMongo();
    if (mongoData) {
      return mongoData;
    }
  }

  // 2. Fallback resiliente no arquivo local JSON
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = await fs.promises.readFile(DATA_FILE, "utf-8");
      const parsed: ConteudoFauna = JSON.parse(raw);
      // Sanitização defensiva do carrossel para garantir propriedades padronizadas
      if (parsed.carrossel && Array.isArray(parsed.carrossel.itens)) {
        parsed.carrossel.itens = parsed.carrossel.itens.map((it: any) => ({
          id: it.id || `item-${Date.now()}`,
          titulo: it.titulo || it.nome || "Espécie Silvestre",
          subtitulo: it.subtitulo || "",
          grupo: it.grupo || "MAMIFERO",
          fotoUrl: it.fotoUrl || it.imagemUrl || "/images/fauna/capivara.jpg",
          ativo: it.ativo !== undefined ? Boolean(it.ativo) : true,
        }));
      }
      return parsed;
    }
  } catch (error) {
    console.error("Erro ao ler conteudo_fauna.json, gerando estado de recuperação:", error);
  }

  // Se não existir, cria o diretório e inicializa
  const fallback = gerarDadosPadrao();
  await saveConteudo(fallback);
  return fallback;
}

/**
 * Gravação atômica em disco e no MongoDB
 */
export async function saveConteudo(conteudo: ConteudoFauna): Promise<void> {
  // Salva no MongoDB se configurado
  if (isMongoConfigured()) {
    await saveConteudoToMongo(conteudo);
  }

  // Salva no disco local com salvaguarda para ambiente serverless
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }

    const tmpFile = `${DATA_FILE}.tmp.${Date.now()}`;
    const data = JSON.stringify(conteudo, null, 2);

    await fs.promises.writeFile(tmpFile, data, "utf-8");
    await fs.promises.rename(tmpFile, DATA_FILE);
  } catch (err) {
    if (!isMongoConfigured()) {
      console.error("Falha ao salvar no disco local:", err);
    }
  }
}

/**
 * Retorna as mídias da esteira/carrossel respeitando itens ativos e limite máximo
 */
export async function getCarrosselHero(): Promise<CarrosselItem[]> {
  const conteudo = await getConteudo();
  const limite = Math.max(3, Math.min(20, conteudo.carrossel.limiteMaximo || 10));
  const ativos = conteudo.carrossel.itens.filter((item) => item.ativo);
  return ativos.slice(0, limite);
}

/**
 * Atualiza configurações de limite e lista de mídias do carrossel
 */
export async function updateCarrossel(
  limiteMaximo: number,
  itens: CarrosselItem[]
): Promise<CarrosselConfig> {
  const conteudo = await getConteudo();
  // Trava de segurança: garante limite entre 3 e 20
  const limiteSeguro = Math.max(3, Math.min(20, limiteMaximo));

  // Sanitiza os itens recebidos
  const itensSanitizados: CarrosselItem[] = itens.map((it: any) => ({
    id: it.id,
    titulo: it.titulo || it.nome || "Espécie Silvestre",
    subtitulo: it.subtitulo || "",
    grupo: it.grupo || "MAMIFERO",
    fotoUrl: it.fotoUrl || it.imagemUrl || "/images/fauna/capivara.jpg",
    ativo: it.ativo !== undefined ? Boolean(it.ativo) : true,
  }));

  // Trava de segurança: impede desativar todas as imagens (mínimo 3 ativas)
  const ativos = itensSanitizados.filter((i) => i.ativo);
  if (ativos.length < 3) {
    throw new Error("O carrossel precisa ter no mínimo 3 imagens ativas para funcionar com fluidez.");
  }

  conteudo.carrossel = {
    limiteMaximo: limiteSeguro,
    itens: itensSanitizados,
  };

  await saveConteudo(conteudo);
  return conteudo.carrossel;
}

/**
 * Lista todas as espécies
 */
export async function getEspecies(): Promise<EspecieData[]> {
  const conteudo = await getConteudo();
  return conteudo.especies;
}

/**
 * Busca espécie por ID
 */
export async function getEspecieById(id: string): Promise<EspecieData | null> {
  const conteudo = await getConteudo();
  return conteudo.especies.find((e) => e.id === id) || null;
}

/**
 * Cria nova espécie com validação
 */
export async function createEspecie(dados: Omit<EspecieData, "id">): Promise<EspecieData> {
  const validacao = validarEspecie(dados);
  if (!validacao.valido) {
    throw new Error(validacao.erros.join(" "));
  }

  const conteudo = await getConteudo();

  // Gera ID amigável único a partir do nome popular
  const slugBase = dados.nomePopular
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let novoId = slugBase || `esp-${Date.now()}`;
  let count = 1;
  while (conteudo.especies.some((e) => e.id === novoId)) {
    novoId = `${slugBase}-${count++}`;
  }

  const novaEspecie: EspecieData = {
    ...dados,
    id: novoId,
  };

  conteudo.especies.push(novaEspecie);

  // Se marcada para exibir na Home, adiciona ao carrossel
  if (dados.exibirNoCarrosselHome) {
    conteudo.carrossel.itens.push({
      id: novaEspecie.id,
      titulo: novaEspecie.nomePopular,
      subtitulo: novaEspecie.nomeCientifico,
      grupo: novaEspecie.grupo,
      fotoUrl: novaEspecie.fotoReferenciaUrl,
      ativo: true,
    });
  }

  await saveConteudo(conteudo);
  return novaEspecie;
}

/**
 * Atualiza espécie existente
 */
export async function updateEspecie(id: string, dados: Partial<EspecieData>): Promise<EspecieData> {
  const conteudo = await getConteudo();
  const index = conteudo.especies.findIndex((e) => e.id === id);

  if (index === -1) {
    throw new Error(`Espécie com ID '${id}' não foi encontrada.`);
  }

  const dadosAtualizados: EspecieData = {
    ...conteudo.especies[index],
    ...dados,
    id, // impede alteração de ID para preservar referências
  };

  const validacao = validarEspecie(dadosAtualizados);
  if (!validacao.valido) {
    throw new Error(validacao.erros.join(" "));
  }

  conteudo.especies[index] = dadosAtualizados;

  // Sincroniza foto/título no carrossel se existir
  const itemCarrosselIndex = conteudo.carrossel.itens.findIndex((item) => item.id === id);
  if (itemCarrosselIndex !== -1) {
    conteudo.carrossel.itens[itemCarrosselIndex] = {
      ...conteudo.carrossel.itens[itemCarrosselIndex],
      titulo: dadosAtualizados.nomePopular,
      subtitulo: dadosAtualizados.nomeCientifico,
      fotoUrl: dadosAtualizados.fotoReferenciaUrl,
      grupo: dadosAtualizados.grupo,
      ativo: dadosAtualizados.exibirNoCarrosselHome ?? conteudo.carrossel.itens[itemCarrosselIndex].ativo,
    };
  } else if (dadosAtualizados.exibirNoCarrosselHome) {
    conteudo.carrossel.itens.push({
      id: dadosAtualizados.id,
      titulo: dadosAtualizados.nomePopular,
      subtitulo: dadosAtualizados.nomeCientifico,
      grupo: dadosAtualizados.grupo,
      fotoUrl: dadosAtualizados.fotoReferenciaUrl,
      ativo: true,
    });
  }

  await saveConteudo(conteudo);
  return dadosAtualizados;
}

/**
 * Exclui espécie tratando integridade referencial
 */
export async function deleteEspecie(id: string): Promise<boolean> {
  const conteudo = await getConteudo();
  const index = conteudo.especies.findIndex((e) => e.id === id);

  if (index === -1) {
    return false;
  }

  // Remove da lista de espécies
  conteudo.especies.splice(index, 1);

  // Remove do carrossel se estiver presente
  conteudo.carrossel.itens = conteudo.carrossel.itens.filter((item) => item.id !== id);

  // Desvincula com segurança das ocorrências (evita referências órfãs)
  conteudo.ocorrencias = conteudo.ocorrencias.map((ocorr) => {
    if (ocorr.especieSugeridaId === id) {
      return { ...ocorr, especieSugeridaId: null };
    }
    return ocorr;
  });

  await saveConteudo(conteudo);
  return true;
}

/**
 * Retorna todas as ocorrências cadastradas
 */
export async function getOcorrencias(): Promise<OcorrenciaData[]> {
  const conteudo = await getConteudo();
  return conteudo.ocorrencias;
}

/**
 * Retorna apenas as ocorrências com fotos validadas e aprovadas para uma espécie
 */
export async function getOcorrenciasValidadasPorEspecie(especieId: string): Promise<OcorrenciaData[]> {
  const conteudo = await getConteudo();
  return conteudo.ocorrencias.filter(
    (o) => o.especieSugeridaId === especieId && o.statusValidacao === "VALIDADO" && o.aprovadoParaGaleria && o.fotoUrl
  );
}

/**
 * Moderação de ocorrência: aprovar para galeria, rejeitar ou corrigir espécie
 */
export async function moderarOcorrencia(
  id: string,
  dados: {
    statusValidacao: "PENDENTE" | "VALIDADO" | "REJEITADO";
    aprovadoParaGaleria?: boolean;
    especieSugeridaId?: string | null;
  }
): Promise<OcorrenciaData> {
  const conteudo = await getConteudo();
  const index = conteudo.ocorrencias.findIndex((o) => o.id === id);

  if (index === -1) {
    throw new Error(`Ocorrência com ID '${id}' não encontrada.`);
  }

  conteudo.ocorrencias[index] = {
    ...conteudo.ocorrencias[index],
    statusValidacao: dados.statusValidacao,
    aprovadoParaGaleria: dados.aprovadoParaGaleria ?? (dados.statusValidacao === "VALIDADO"),
    especieSugeridaId: dados.especieSugeridaId !== undefined ? dados.especieSugeridaId : conteudo.ocorrencias[index].especieSugeridaId,
  };

  await saveConteudo(conteudo);
  return conteudo.ocorrencias[index];
}

/**
 * Adiciona uma nova ocorrência (enviada pelo formulário de campo)
 */
export async function addOcorrencia(dados: Omit<OcorrenciaData, "id" | "protocolo" | "statusValidacao" | "aprovadoParaGaleria" | "dataHoraAvistamento">): Promise<OcorrenciaData> {
  const conteudo = await getConteudo();
  const protocolo = `ARA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const novaOcorr: OcorrenciaData = {
    ...dados,
    id: `ocorr-${Date.now()}`,
    protocolo,
    statusValidacao: "PENDENTE",
    aprovadoParaGaleria: false,
    dataHoraAvistamento: new Date().toISOString(),
  };

  conteudo.ocorrencias.unshift(novaOcorr);
  await saveConteudo(conteudo);
  return novaOcorr;
}

/**
 * Restaura os dados originais padrão de Araçoiaba da Serra
 */
export async function resetParaPadrao(): Promise<ConteudoFauna> {
  const padrao = gerarDadosPadrao();
  await saveConteudo(padrao);
  return padrao;
}

function gerarDadosPadrao(): ConteudoFauna {
  // Retorna os dados das 10 espécies padrão
  return {
    carrossel: {
      limiteMaximo: 10,
      itens: [
        {
          id: "capivara",
          titulo: "Capivara",
          subtitulo: "Hydrochoerus hydrochaeris",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/capivara.jpg",
          ativo: true,
        },
        {
          id: "sarue",
          titulo: "Saruê / Gambá",
          subtitulo: "Didelphis albiventris",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/sarue.jpg",
          ativo: true,
        },
        {
          id: "quati",
          titulo: "Quati",
          subtitulo: "Nasua nasua",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/quati.jpg",
          ativo: true,
        },
        {
          id: "tucano-toco",
          titulo: "Tucano-toco",
          subtitulo: "Ramphastos toco",
          grupo: "AVE",
          fotoUrl: "/images/fauna/tucano-toco.jpg",
          ativo: true,
        },
        {
          id: "sagui-tufo-preto",
          titulo: "Sagui-do-tufo-preto",
          subtitulo: "Callithrix penicillata",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/sagui-tufo-preto.jpg",
          ativo: true,
        },
        {
          id: "coruja-buraqueira",
          titulo: "Coruja-buraqueira",
          subtitulo: "Athene cunicularia",
          grupo: "AVE",
          fotoUrl: "/images/fauna/coruja-buraqueira.jpg",
          ativo: true,
        },
        {
          id: "teiu",
          titulo: "Teiú",
          subtitulo: "Salvator merianae",
          grupo: "REPTIL",
          fotoUrl: "/images/fauna/teiu.jpg",
          ativo: true,
        },
        {
          id: "tamandua-bandeira",
          titulo: "Tamanduá-bandeira",
          subtitulo: "Myrmecophaga tridactyla",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/tamandua-bandeira.jpg",
          ativo: true,
        },
        {
          id: "onca-parda",
          titulo: "Onça-parda",
          subtitulo: "Puma concolor",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/onca-parda.jpg",
          ativo: true,
        },
        {
          id: "carcara",
          titulo: "Carcará",
          subtitulo: "Caracara plancus",
          grupo: "AVE",
          fotoUrl: "/images/fauna/carcara.jpg",
          ativo: true,
        },
        {
          id: "lobo-guara",
          titulo: "Lobo-guará",
          subtitulo: "Chrysocyon brachyurus",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/lobo-guara.jpg",
          ativo: true,
        },
        {
          id: "jaguatirica",
          titulo: "Jaguatirica",
          subtitulo: "Leopardus pardalis",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/jaguatirica.jpg",
          ativo: true,
        },
        {
          id: "tamandua-mirim",
          titulo: "Tamanduá-mirim",
          subtitulo: "Tamandua tetradactyla",
          grupo: "MAMIFERO",
          fotoUrl: "/images/fauna/tamandua-mirim.jpg",
          ativo: true,
        },
        {
          id: "urubu-rei",
          titulo: "Urubu-rei",
          subtitulo: "Sarcoramphus papa",
          grupo: "AVE",
          fotoUrl: "/images/fauna/urubu-rei.jpg",
          ativo: true,
        },
      ],
    },
    especies: [
      {
        id: "capivara",
        nomePopular: "Capivara",
        nomeCientifico: "Hydrochoerus hydrochaeris",
        grupo: "MAMIFERO",
        statusConservacao: "LC",
        descricao: "Maior roedor do mundo. Animal semi-aquático e herbívoro que vive em grupos familiares próximos a represas, lagoas e áreas gramadas de Araçoiaba da Serra.",
        habitat: "Margens de rios, represas, lagos municipais e várzeas.",
        orientacoesConvivencia: "Mantenha distância de segurança (ao menos 5 a 10 metros), especialmente se houver filhotes no bando. Não alimente e evite deitar em gramados frequentados por capivaras devido ao carrapato-estrela.",
        fotoReferenciaUrl: "/images/fauna/capivara.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "sarue",
        nomePopular: "Saruê / Gambá-de-orelha-branca",
        nomeCientifico: "Didelphis albiventris",
        grupo: "MAMIFERO",
        statusConservacao: "LC",
        descricao: "Marsupial nativo noturno e solitário. É um dos principais controladores naturais de pragas, alimentando-se ativamente de escorpiões, aranhas-armadeiras, carrapatos, baratas e pequenas serpentes.",
        habitat: "Matas, capões, forros de telhados e árvores em áreas urbanas e rurais.",
        orientacoesConvivencia: "Animal completamente inofensivo. Nunca agrida ou mate um saruê. Se entrar em sua casa ou forro, mantenha portas ou janelas abertas à noite para que ele saia sozinho em busca de alimento.",
        fotoReferenciaUrl: "/images/fauna/sarue.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "quati",
        nomePopular: "Quati",
        nomeCientifico: "Nasua nasua",
        grupo: "MAMIFERO",
        statusConservacao: "LC",
        descricao: "Mamífero onívoro de focinho alongado e cauda anelada. Vive em bandos ativos durante o dia revirando o solo e copas de árvores em busca de frutos e invertebrados.",
        habitat: "Florestas nativas, bordas de matas e parques ecológicos da região.",
        orientacoesConvivencia: "Não ofereça biscoitos, pães ou salgadinhos. Alimentos humanos provocam habituação e agressividade, além de doenças digestivas graves.",
        fotoReferenciaUrl: "/images/fauna/quati.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "tucano-toco",
        nomePopular: "Tucano-toco",
        nomeCientifico: "Ramphastos toco",
        grupo: "AVE",
        statusConservacao: "LC",
        descricao: "Maior espécie de tucano do planeta, emblemático pelo enorme bico amarelo-alaranjado com ponta preta. Desempenha papel ecológico vital na dispersão de sementes de árvores da Mata Atlântica e Cerrado.",
        habitat: "Copas de florestas, cerrados, pomares e áreas arborizadas da cidade.",
        orientacoesConvivencia: "Aprecie a observação à distância. Plante e preserve árvores frutíferas nativas (embaúba, pitangueira, figueira-brava) para atrair a espécie.",
        fotoReferenciaUrl: "/images/fauna/tucano-toco.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "sagui-tufo-preto",
        nomePopular: "Sagui-do-tufo-preto",
        nomeCientifico: "Callithrix penicillata",
        grupo: "MAMIFERO",
        statusConservacao: "LC",
        descricao: "Pequeno primata muito ágil com característicos tufos pretos circundando as orelhas. Alimenta-se de goma vegetal, seiva de árvores, pequenos frutos e insetos.",
        habitat: "Matas secundárias, capoeiras e áreas com árvores frutíferas.",
        orientacoesConvivencia: "Não alimente com restos de comida ou doces. A alimentação artificial desequilibra seu sistema biológico e favorece a transmissão de zoonoses.",
        fotoReferenciaUrl: "/images/fauna/sagui-tufo-preto.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "coruja-buraqueira",
        nomePopular: "Coruja-buraqueira",
        nomeCientifico: "Athene cunicularia",
        grupo: "AVE",
        statusConservacao: "LC",
        descricao: "Pequena coruja terrestre de olhos amarelos vivos e patas longas. Vive em buracos cavados no solo e atua com grande eficiência no controle de roedores e gafanhotos.",
        habitat: "Campos abertos, pastos, terrenos baldios, canteiros centrais e margens de estradas.",
        orientacoesConvivencia: "Não mexa nem tente fechar as tocas no chão. Ao avistar ninhos em pastos ou calçadas, mantenha cães e animais domésticos afastados.",
        fotoReferenciaUrl: "/images/fauna/coruja-buraqueira.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "teiu",
        nomePopular: "Teiú",
        nomeCientifico: "Salvator merianae",
        grupo: "REPTIL",
        statusConservacao: "LC",
        descricao: "Maior lagarto da fauna brasileira, podendo atingir até 1,40m de comprimento. Possui escamas escuras com faixas claras e hábito de tomar sol sobre pedras e troncos caídos.",
        habitat: "Bordas de matas, capoeiras, pomares e áreas rurais.",
        orientacoesConvivencia: "Animal dócil que prefere fugir ao notar presença humana. Não encurrale nem tente manuseá-lo, pois pode se defender com chicotadas de cauda e mordidas se acuado.",
        fotoReferenciaUrl: "/images/fauna/teiu.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "tamandua-bandeira",
        nomePopular: "Tamanduá-bandeira",
        nomeCientifico: "Myrmecophaga tridactyla",
        grupo: "MAMIFERO",
        statusConservacao: "VU",
        descricao: "Espécie ameaçada de extinção (Vulnerável). Mamífero fascinante desprovido de dentes com focinho tubular e cauda plumosa em formato de bandeira. Consome milhares de formigas e cupins diariamente.",
        habitat: "Campos, cerrados e fragmentos florestais protegidos como a Flona de Ipanema.",
        orientacoesConvivencia: "Espécie ameaçada estritamente protegida por lei. Se avistar em rodovias ou perto de residências, avise de imediato a Defesa Civil ou Polícia Ambiental.",
        fotoReferenciaUrl: "/images/fauna/tamandua-bandeira.jpg",
        ameacadaExtincao: true,
        exibirNoCarrosselHome: true,
      },
      {
        id: "onca-parda",
        nomePopular: "Onça-parda / Suçuarana",
        nomeCientifico: "Puma concolor",
        grupo: "MAMIFERO",
        statusConservacao: "VU",
        descricao: "Segundo maior felino do continente americano. Animal de pelagem avermelhada e corpo esguio, topo de cadeia alimentar e regulador do ecossistema das serras e matas da região.",
        habitat: "Matas densas, encostas de morros e áreas de preservação florestal.",
        orientacoesConvivencia: "Encontros são extremamente raros. Se avistar, não corra, não vire as costas, mantenha contato visual e recolha crianças. Comunique imediatamente as autoridades ambientais.",
        fotoReferenciaUrl: "/images/fauna/onca-parda.jpg",
        ameacadaExtincao: true,
        exibirNoCarrosselHome: true,
      },
      {
        id: "carcara",
        nomePopular: "Carcará",
        nomeCientifico: "Caracara plancus",
        grupo: "AVE",
        statusConservacao: "LC",
        descricao: "Ave de rapina de porte médio com penacho preto na cabeça e bico forte e curvo. Onívora e oportunista, desempenha função sanitária ao consumir carcaças e pequenos animais atropelados.",
        habitat: "Campos, pastagens, bordas de matas e margens de rodovias e vicinais.",
        orientacoesConvivencia: "Ave de rapina benéfica para a limpeza ambiental. Não interfira quando estiver forrageando às margens das estradas.",
        fotoReferenciaUrl: "/images/fauna/carcara.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "lobo-guara",
        nomePopular: "Lobo-guará",
        nomeCientifico: "Chrysocyon brachyurus",
        grupo: "MAMIFERO",
        statusConservacao: "VU",
        descricao: "Maior canídeo silvestre da América do Sul, caracterizado pelas pernas longas e pelagem avermelhada. Possui hábitos crepusculares e solitários, sendo fundamental na dispersão de frutos do cerrado.",
        habitat: "Campos abertos, bordas de cerradão e remanescentes florestais no entorno do Morro do Araçoiaba.",
        orientacoesConvivencia: "Animal tímido e inofensivo ao ser humano. Mantenha distância respeitosa, reduza a velocidade em estradas rurais e jamais deixe alimentos expostos.",
        fotoReferenciaUrl: "/images/fauna/lobo-guara.jpg",
        ameacadaExtincao: true,
        exibirNoCarrosselHome: true,
      },
      {
        id: "jaguatirica",
        nomePopular: "Jaguatirica",
        nomeCientifico: "Leopardus pardalis",
        grupo: "MAMIFERO",
        statusConservacao: "LC",
        descricao: "Felino de porte médio com pelagem amarelada marcada por ocelos escuros alongados. Ágil escaladora e excelente nadadora, tem hábitos predominantemente noturnos e carnívoros.",
        habitat: "Fragmentos densos de Mata Atlântica e matas ciliares conectadas à Floresta Nacional de Ipanema.",
        orientacoesConvivencia: "Não tente aproximação nem encurrale. Mantenha animais domésticos abrigados durante a noite e informe avistamentos à equipe ambiental.",
        fotoReferenciaUrl: "/images/fauna/jaguatirica.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "tamandua-mirim",
        nomePopular: "Tamanduá-mirim",
        nomeCientifico: "Tamandua tetradactyla",
        grupo: "MAMIFERO",
        statusConservacao: "LC",
        descricao: "Conhecido pela pelagem dourada com mancha escura em formato de colete e cauda preênsil. Especialista em consumir cupins e formigas arbóreas, controlando populações de insetos.",
        habitat: "Matas secundárias, capoeiras e pomares rurais arborizados no município.",
        orientacoesConvivencia: "Possui garras curvas poderosas para defesa. Mantenha cães afastados para evitar ferimentos mútuos e deixe o animal seguir seu curso na vegetação.",
        fotoReferenciaUrl: "/images/fauna/tamandua-mirim.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
      {
        id: "urubu-rei",
        nomePopular: "Urubu-rei",
        nomeCientifico: "Sarcoramphus papa",
        grupo: "AVE",
        statusConservacao: "LC",
        descricao: "Ave de grande porte com envergadura de até 2 metros, cabeça nua com cores vibrantes e plumagem branca e preta. Realiza serviço ecossistêmico crucial ao decompor carcaças.",
        habitat: "Florestas preservadas e paredões rochosos da serra com correntes de ar ascendentes.",
        orientacoesConvivencia: "Espécie silvestre protegida. Evite perturbar locais de pouso ou ninhais nas encostas rochosas.",
        fotoReferenciaUrl: "/images/fauna/urubu-rei.jpg",
        ameacadaExtincao: false,
        exibirNoCarrosselHome: true,
      },
    ],
    ocorrencias: [
      {
        id: "ocorr-1",
        protocolo: "ARA-2026-1042",
        especieSugeridaId: "capivara",
        bairroAreaVerde: "Lago Municipal de Araçoiaba da Serra",
        latitude: -23.5042,
        longitude: -47.6148,
        statusAnimal: "SAUDAVEL",
        statusValidacao: "VALIDADO",
        aprovadoParaGaleria: true,
        dataHoraAvistamento: "2026-09-20T16:30:00.000Z",
        observacoes: "Bando com 6 capivaras pastando na margem gramada do lago ao entardecer.",
        fotoUrl: "/images/fauna/capivara.jpg",
      },
      {
        id: "ocorr-2",
        protocolo: "ARA-2026-1088",
        especieSugeridaId: "tucano-toco",
        bairroAreaVerde: "Centro de Araçoiaba da Serra (Praça da Matriz)",
        latitude: -23.5186,
        longitude: -47.6138,
        statusAnimal: "SAUDAVEL",
        statusValidacao: "VALIDADO",
        aprovadoParaGaleria: true,
        dataHoraAvistamento: "2026-09-21T09:15:00.000Z",
        observacoes: "Dois tucanos pousados em uma figueira no centro da cidade se alimentando.",
        fotoUrl: "/images/fauna/tucano-toco.jpg",
      },
      {
        id: "ocorr-3",
        protocolo: "ARA-2026-1120",
        especieSugeridaId: "sarue",
        bairroAreaVerde: "Bairro Jundiaquara / Estrada do Morro",
        latitude: -23.4890,
        longitude: -47.6250,
        statusAnimal: "SAUDAVEL",
        statusValidacao: "PENDENTE",
        aprovadoParaGaleria: false,
        dataHoraAvistamento: "2026-09-21T18:45:00.000Z",
        observacoes: "Saruê atravessando o muro dos fundos em direção ao capão de mata.",
        fotoUrl: "/images/fauna/sarue.jpg",
      },
      {
        id: "ocorr-4",
        protocolo: "ARA-2026-1155",
        especieSugeridaId: "quati",
        bairroAreaVerde: "Borda da Flona de Ipanema (Morro de Araçoiaba)",
        latitude: -23.4285,
        longitude: -47.6015,
        statusAnimal: "SAUDAVEL",
        statusValidacao: "PENDENTE",
        aprovadoParaGaleria: false,
        dataHoraAvistamento: "2026-09-21T14:20:00.000Z",
        observacoes: "Grupo de quatis revirando folhas secas na beira da estrada rural.",
        fotoUrl: "/images/fauna/quati.jpg",
      },
      {
        id: "ocorr-5",
        protocolo: "ARA-2026-1192",
        especieSugeridaId: "coruja-buraqueira",
        bairroAreaVerde: "Bairro Campo do Meio",
        latitude: -23.5010,
        longitude: -47.5850,
        statusAnimal: "SAUDAVEL",
        statusValidacao: "VALIDADO",
        aprovadoParaGaleria: true,
        dataHoraAvistamento: "2026-09-21T11:00:00.000Z",
        observacoes: "Casal de corujas na cerca de arame cuidando de toca no gramado.",
        fotoUrl: "/images/fauna/coruja-buraqueira.jpg",
      },
    ],
  };
}
