import { PrismaClient, GrupoTaxonomico, StatusConservacao, PapelUsuario, StatusAnimal, StatusValidacao } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de dados (seed) da Fauna Silvestre de Araçoiaba da Serra...');

  // 1. Criar Usuários padrão
  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestao.ambiental@aracoiaba.sp.gov.br' },
    update: {},
    create: {
      nome: 'Biólogo Pedro Ariston (Gestão Ambiental)',
      email: 'gestao.ambiental@aracoiaba.sp.gov.br',
      senhaHash: '$2a$12$e8YQ3fD4gZqG9.yH7M3kO.wR4zL0mN8qP2tV5xY1bC7dE9fG3hJ5k', // Hash simulado
      papel: PapelUsuario.GESTOR_AMBIENTAL,
      telefone: '(15) 3281-0000',
    },
  });

  const cidadao = await prisma.usuario.upsert({
    where: { email: 'cidadao.exemplo@gmail.com' },
    update: {},
    create: {
      nome: 'Morador de Araçoiaba',
      email: 'cidadao.exemplo@gmail.com',
      senhaHash: '$2a$12$e8YQ3fD4gZqG9.yH7M3kO.wR4zL0mN8qP2tV5xY1bC7dE9fG3hJ5k',
      papel: PapelUsuario.CIDADAO,
      telefone: '(15) 99876-5432',
    },
  });

  console.log('Usuários criados.');

  // 2. Criar Espécies Nativas da Região de Araçoiaba da Serra / Flona de Ipanema
  const especiesData = [
    {
      nomePopular: 'Capivara',
      nomeCientifico: 'Hydrochoerus hydrochaeris',
      grupo: GrupoTaxonomico.MAMIFERO,
      familia: 'Caviidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Maior roedor do mundo. Animal semi-aquático, herbívoro e que vive em grupos familiares próximos a corpos d’água e áreas gramadas.',
      habitat: 'Margens de rios, lagoas, represas e áreas de várzea urbanas ou rurais.',
      orientacoesConvivencia: 'Mantenha distância de pelo menos 5 a 10 metros, especialmente se houver filhotes. Não alimente nem tente tocar. Cuidado com carrapatos-estrela em gramados frequentados por capivaras.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1590424744299-4c8d55c783db?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Saruê / Gambá-de-orelha-branca',
      nomeCientifico: 'Didelphis albiventris',
      grupo: GrupoTaxonomico.MAMIFERO,
      familia: 'Didelphidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Marsupial noturno extremamente benéfico para o equilíbrio ecológico. Alimenta-se de escorpiões, aranhas, carrapatos, cobras e frutos caídos.',
      habitat: 'Capões de mata, pomares, forros de residências e áreas urbanas arborizadas.',
      orientacoesConvivencia: 'Animal completamente inofensivo que não ataca humanos. Se entrar em sua casa ou forro, deixe portas abertas à noite para que saia espontaneamente. Nunca agrida.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Quati',
      nomeCientifico: 'Nasua nasua',
      grupo: GrupoTaxonomico.MAMIFERO,
      familia: 'Procyonidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Mamífero onívoro de cauda anelada e focinho alongado. Vive em bandos ativos durante o dia explorando o solo e copas de árvores.',
      habitat: 'Matas ciliares, parques florestais e bordas de mata como na Flona de Ipanema.',
      orientacoesConvivencia: 'Não ofereça alimentos humanos (salgadinhos, pães). Guarde lixeiras bem fechadas para evitar habituação.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Sagui-do-tufo-preto',
      nomeCientifico: 'Callithrix penicillata',
      grupo: GrupoTaxonomico.MAMIFERO,
      familia: 'Callitrichidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Primata de pequeno porte com tufos pretos característicos ao redor das orelhas. Alimenta-se de goma de árvores, néctar, frutos e pequenos insetos.',
      habitat: 'Matas secundárias, capoeiras e parques urbanos bem arborizados.',
      orientacoesConvivencia: 'Não alimente saguis com alimentos processados. Alimentar primatas silvestres altera seu comportamento natural e transmite doenças.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Tucano-toco',
      nomeCientifico: 'Ramphastos toco',
      grupo: GrupoTaxonomico.AVE,
      familia: 'Ramphastidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Maior espécie de tucano, com plumagem preta contrastante, papo branco e bico alaranjado imponente. Excelente dispersor de sementes.',
      habitat: 'Florestas de galeria, cerrados e áreas urbanas com árvores frutíferas.',
      orientacoesConvivencia: 'Aprecie a observação e o canto à distância. Proteja árvores frutíferas nativas em seu quintal como embaúba, pitanga e figueira.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Coruja-buraqueira',
      nomeCientifico: 'Athene cunicularia',
      grupo: GrupoTaxonomico.AVE,
      familia: 'Strigidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Pequena coruja de hábitos diurnos e crepusculares. Faz ninhos em buracos no solo e atua como controladora voraz de insetos e roedores.',
      habitat: 'Campos abertos, pastagens, canteiros centrais e terrenos baldios.',
      orientacoesConvivencia: 'Não perturbe os ninhos cavados no chão nem permita que cães se aproximem dos filhotes.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Teiú',
      nomeCientifico: 'Salvator merianae',
      grupo: GrupoTaxonomico.REPTIL,
      familia: 'Teiidae',
      statusConservacao: StatusConservacao.LC,
      descricao: 'Maior lagarto do Brasil, podendo ultrapassar 1,4 metros de comprimento. Espécie onívora de sangue frio que costuma tomar sol em pedras.',
      habitat: 'Bordas de florestas, áreas rurais, gramados e jardins com vegetação densa.',
      orientacoesConvivencia: 'Animal pacífico que foge ao notar presença humana. Não encurrale nem tente manusear, pois pode morder ou desferir golpes com a cauda para se defender.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: false,
    },
    {
      nomePopular: 'Tamanduá-bandeira',
      nomeCientifico: 'Myrmecophaga tridactyla',
      grupo: GrupoTaxonomico.MAMIFERO,
      familia: 'Myrmecophagidae',
      statusConservacao: StatusConservacao.VU,
      descricao: 'Mamífero de grande porte emblemático do Cerrado e Mata Atlântica. Alimenta-se exclusivamente de formigas e cupins. Espécie ameaçada de extinção.',
      habitat: 'Campos, cerradões e fragmentos florestais da região de Iperó e Araçoiaba.',
      orientacoesConvivencia: 'Mantenha distância segura. Se avistar em rodovias ou ferido, acione imediatamente a Defesa Civil ou Polícia Militar Ambiental.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: true,
    },
    {
      nomePopular: 'Onça-parda / Suçuarana',
      nomeCientifico: 'Puma concolor',
      grupo: GrupoTaxonomico.MAMIFERO,
      familia: 'Felidae',
      statusConservacao: StatusConservacao.VU,
      descricao: 'Segundo maior felino das Américas, topo de cadeia alimentar e regulador fundamental dos ecossistemas da Flona de Ipanema e serra vizinha.',
      habitat: 'Florestas densas, encostas de morros e áreas com mata ciliar contínua.',
      orientacoesConvivencia: 'Em caso raro de avistamento, não corra, não vire as costas e recolha crianças. Notifique os órgãos ambientais imediatamente.',
      fotoReferenciaUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80',
      ameacadaExtincao: true,
    },
  ];

  for (const esp of especiesData) {
    await prisma.especie.upsert({
      where: { nomeCientifico: esp.nomeCientifico },
      update: esp,
      create: esp,
    });
  }

  console.log(`${especiesData.length} espécies cadastradas com sucesso.`);

  // 3. Criar 3 ocorrências de demonstração georreferenciadas em Araçoiaba da Serra
  const capivara = await prisma.especie.findUnique({ where: { nomeCientifico: 'Hydrochoerus hydrochaeris' } });
  const sarue = await prisma.especie.findUnique({ where: { nomeCientifico: 'Didelphis albiventris' } });
  const tucano = await prisma.especie.findUnique({ where: { nomeCientifico: 'Ramphastos toco' } });

  if (capivara) {
    const oc1 = await prisma.ocorrencia.upsert({
      where: { protocolo: 'ARA-2026-0001' },
      update: {},
      create: {
        protocolo: 'ARA-2026-0001',
        usuarioId: cidadao.id,
        especieSugeridaId: capivara.id,
        latitude: -23.5186,
        longitude: -47.6138,
        precisaoGpsMetros: 5.2,
        bairroAreaVerde: 'Parque Ecológico Municipal',
        enderecoAproximado: 'Av. Dr. Luíz Vergueiro, Centro',
        statusAnimal: StatusAnimal.SAUDAVEL,
        quantidade: 4,
        dataHoraAvistamento: new Date('2026-09-15T16:30:00Z'),
        observacoes: 'Grupo familiar de capivaras descansando na margem do lago ao entardecer.',
        statusValidacao: StatusValidacao.VALIDADO,
      },
    });

    await prisma.ocorrenciaMidia.create({
      data: {
        ocorrenciaId: oc1.id,
        tipo: 'FOTO',
        urlOriginal: 'https://images.unsplash.com/photo-1590424744299-4c8d55c783db?auto=format&fit=crop&w=800&q=80',
      },
    });
  }

  if (sarue) {
    const oc2 = await prisma.ocorrencia.upsert({
      where: { protocolo: 'ARA-2026-0002' },
      update: {},
      create: {
        protocolo: 'ARA-2026-0002',
        usuarioId: cidadao.id,
        especieSugeridaId: sarue.id,
        latitude: -23.5221,
        longitude: -47.6184,
        precisaoGpsMetros: 8.0,
        bairroAreaVerde: 'Bairro Jardim Salum',
        enderecoAproximado: 'Rua das Palmeiras',
        statusAnimal: StatusAnimal.SAUDAVEL,
        quantidade: 1,
        dataHoraAvistamento: new Date('2026-09-16T21:10:00Z'),
        observacoes: 'Saruê caminhando sobre o muro dos fundos em direção a uma árvore frutífera.',
        statusValidacao: StatusValidacao.VALIDADO,
      },
    });

    await prisma.ocorrenciaMidia.create({
      data: {
        ocorrenciaId: oc2.id,
        tipo: 'FOTO',
        urlOriginal: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=800&q=80',
      },
    });
  }

  if (tucano) {
    const oc3 = await prisma.ocorrencia.upsert({
      where: { protocolo: 'ARA-2026-0003' },
      update: {},
      create: {
        protocolo: 'ARA-2026-0003',
        usuarioId: cidadao.id,
        especieSugeridaId: tucano.id,
        latitude: -23.5095,
        longitude: -47.6052,
        precisaoGpsMetros: 12.5,
        bairroAreaVerde: 'Estrada Vicinal Araçoiaba-Iperó',
        enderecoAproximado: 'Próximo ao acesso da Flona',
        statusAnimal: StatusAnimal.SAUDAVEL,
        quantidade: 2,
        dataHoraAvistamento: new Date('2026-09-17T08:45:00Z'),
        observacoes: 'Casal de tucanos alimentando-se em uma embaúba florida.',
        statusValidacao: StatusValidacao.PENDENTE,
      },
    });

    await prisma.ocorrenciaMidia.create({
      data: {
        ocorrenciaId: oc3.id,
        tipo: 'FOTO',
        urlOriginal: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&w=800&q=80',
      },
    });
  }

  console.log('Carga inicial (seed) finalizada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
