import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_full_report():
    doc = docx.Document()

    # Configurar margens ABNT: Sup/Esq 3cm, Inf/Dir 2cm
    for s in doc.sections:
        s.top_margin = Inches(1.181)     # 3 cm
        s.left_margin = Inches(1.181)    # 3 cm
        s.bottom_margin = Inches(0.787)  # 2 cm
        s.right_margin = Inches(0.787)   # 2 cm

    # Estilo Normal: Times New Roman 12, 1.5 linhas, cor preta
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, line_spacing=1.5, bold=False, italic=False, size=12):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            run = p.add_run(text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(size)
            run.bold = bold
            run.italic = italic
            run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_h1(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(title.upper())
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_h2(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(title)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_h3(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(title)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_quote_block(text, author_ref=""):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(1.57)  # 4 cm de recuo ABNT
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.0  # Espaçamento simples
        run = p.add_run(text + " " + author_ref)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(10)  # Tamanho 10
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_figure(img_path, title, fonte="Fonte: Elaborado pelos autores (2026).", width=Inches(5.8)):
        # Título da Figura (ABNT NBR 14724: centralizado, negrito, 10.5 pt)
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.space_before = Pt(14)
        p_title.paragraph_format.space_after = Pt(4)
        p_title.paragraph_format.line_spacing = 1.0
        p_title.paragraph_format.keep_with_next = True
        r_t = p_title.add_run(title)
        r_t.font.name = 'Times New Roman'
        r_t.font.size = Pt(10.5)
        r_t.bold = True
        r_t.font.color.rgb = RGBColor(0, 0, 0)

        # Imagem centralizada
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(2)
        p_img.paragraph_format.space_after = Pt(2)
        p_img.paragraph_format.keep_with_next = True
        r_img = p_img.add_run()
        r_img.add_picture(img_path, width=width)

        # Fonte (ABNT NBR 14724: centralizado, itálico, 10 pt)
        p_f = doc.add_paragraph()
        p_f.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_f.paragraph_format.space_before = Pt(2)
        p_f.paragraph_format.space_after = Pt(14)
        p_f.paragraph_format.line_spacing = 1.0
        r_f = p_f.add_run(fonte)
        r_f.font.name = 'Times New Roman'
        r_f.font.size = Pt(10)
        r_f.italic = True
        r_f.font.color.rgb = RGBColor(0, 0, 0)

    # ==========================================
    # 1. CAPA
    # ==========================================
    add_p("UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=36)
    
    add_p("JAQUELINE MACENA SANTOS SILVA - RA: 24220430\nWILLYAN DE MORAES LEOCADIO - RA: 23227255\nJOÃO VITOR FARIA CYPULLO - RA: 23209533", 
          align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=120)

    add_p("FAUNA DA SERRA: PLATAFORMA COLABORATIVA DE CIÊNCIA CIDADÃ PARA MONITORAMENTO DA BIODIVERSIDADE REGIONAL EM ARAÇOIABA DA SERRA", 
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=200)

    add_p("Araçoiaba da Serra - SP\n2026", align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # 2. FOLHA DE ROSTO
    # ==========================================
    add_p("UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=36)

    add_p("JAQUELINE MACENA SANTOS SILVA\nWILLYAN DE MORAES LEOCADIO\nJOÃO VITOR FARIA CYPULLO", 
          align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=80)

    add_p("FAUNA DA SERRA: PLATAFORMA COLABORATIVA DE CIÊNCIA CIDADÃ PARA MONITORAMENTO DA BIODIVERSIDADE REGIONAL EM ARAÇOIABA DA SERRA", 
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=60)

    # Nota de apresentação recuada
    p_nota = doc.add_paragraph()
    p_nota.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_nota.paragraph_format.left_indent = Inches(2.95) # Recuo para a metade direita
    p_nota.paragraph_format.space_after = Pt(120)
    p_nota.paragraph_format.line_spacing = 1.0
    r_nota = p_nota.add_run(
        "Relatório Técnico-Científico apresentado na disciplina de Projeto Integrador em Computação II para os cursos de Engenharia de Computação e Ciência de Dados da Universidade Virtual do Estado de São Paulo (UNIVESP).\n\n"
        "Polo(s): Capela do Alto, Tatuí, Ibiúna\n"
        "Orientador: Pedro Ariston Costa Pessoa"
    )
    r_nota.font.name = 'Times New Roman'
    r_nota.font.size = Pt(10)

    add_p("Araçoiaba da Serra - SP\n2026", align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # 3. RESUMO
    # ==========================================
    add_p("RESUMO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_after=18)

    add_p(
        "A convivência cotidiana entre centros urbanos em expansão e áreas de mata nativa no interior paulista exige instrumentos eficientes de comunicação e monitoramento ambiental. No município de Araçoiaba da Serra, vizinho à Floresta Nacional de Ipanema, o contato frequente entre munícipes e animais silvestres ocorre sem o respaldo de canais estruturados de atendimento, resultando em registros dispersos, desinformação popular e demora no resgate de animais feridos. Este trabalho tem como objetivo desenvolver e avaliar o Fauna da Serra, uma plataforma web colaborativa, baseada nos preceitos da Ciência Cidadã, voltada à catalogação, registro georreferenciado e educação ambiental sobre a fauna silvestre regional. A metodologia adotada apoia-se nas três etapas do Design Thinking da UNIVESP: Ouvir e Interpretar, onde foram realizadas conversas com membros da comunidade escolar e moradores durante a Semana do Meio Ambiente; Criar, com a definição dos requisitos funcionais, elaboração de wireframes acessíveis e modelagem de banco de dados espacial (PostgreSQL com PostGIS); e Implementar/Testar, com a validação preliminar do protótipo inicial junto a moradores e à orientação pedagógica. Os resultados parciais demonstram a estruturação de um catálogo ilustrado com dez espécies nativas reais, um formulário responsivo com detecção automática de GPS e um fluxo ágil com orientações de socorro e botões diretos para serviços de emergência (Defesa Civil, Bombeiros e Polícia Ambiental), comprovando a viabilidade da solução para apoiar a conservação da biodiversidade regional.",
        align=WD_ALIGN_PARAGRAPH.JUSTIFY,
        line_spacing=1.5,
        space_after=18
    )

    p_kw = add_p("", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=24)
    r_kw_title = p_kw.add_run("PALAVRAS-CHAVE: ")
    r_kw_title.bold = True
    r_kw_title.font.name = 'Times New Roman'
    r_kw_title.font.size = Pt(12)
    r_kw_text = p_kw.add_run("Ciência Cidadã; Fauna da Serra; Biodiversidade Regional; Araçoiaba da Serra; Aplicações Web.")
    r_kw_text.font.name = 'Times New Roman'
    r_kw_text.font.size = Pt(12)

    doc.add_page_break()

    # ==========================================
    # 4. SUMÁRIO
    # ==========================================
    add_p("SUMÁRIO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_after=24)

    sumario_itens = [
        ("1 INTRODUÇÃO", "5"),
        ("2 DESENVOLVIMENTO", "6"),
        ("  2.1 Objetivos", "6"),
        ("  2.2 Justificativa e delimitação do problema", "7"),
        ("  2.3 Fundamentação teórica", "8"),
        ("  2.4 Metodologia", "10"),
        ("  2.5 Resultados preliminares: solução inicial", "12"),
        ("REFERÊNCIAS", "15")
    ]

    for item, pag in sumario_itens:
        p_s = doc.add_paragraph()
        p_s.paragraph_format.line_spacing = 1.5
        p_s.paragraph_format.space_after = Pt(4)
        run_i = p_s.add_run(item)
        run_i.font.name = 'Times New Roman'
        run_i.font.size = Pt(12)
        if not item.startswith("  "):
            run_i.bold = True

    doc.add_page_break()

    # ==========================================
    # 1 INTRODUÇÃO
    # ==========================================
    add_h1("1 INTRODUÇÃO")

    add_p(
        "Nas cidades do interior paulista, o crescimento dos bairros residenciais e a abertura de novas vias têm aproximado cada vez mais o cotidiano das pessoas da vida silvestre. Em Araçoiaba da Serra, essa proximidade faz parte da rotina dos moradores. O município está localizado em uma região privilegiada de transição ecológica entre a Mata Atlântica e o Cerrado, além de ser vizinho direto de uma das maiores áreas de preservação do estado, a Floresta Nacional de Ipanema (Flona de Ipanema). Por conta disso, ver animais silvestres atravessando ruas, pastos, áreas verdes urbanas ou até mesmo quintais de casas não é algo raro, mas sim um acontecimento frequente."
    )

    add_p(
        "Apesar dessa convivência constante, a cidade ainda não conta com canais de informação e comunicação rápidos e acessíveis para lidar com essas situações. Muitas vezes, os munícipes não sabem identificar o animal que acabaram de avistar, o que acaba gerando medo infundado, reações desastradas de captura ou agressões a espécies totalmente inofensivas. Além disso, quando alguém encontra um animal machucado, vítima de atropelamento nas estradas vicinais ou um filhote caído do ninho, surge a dúvida imediata sobre quem chamar ou quais cuidados básicos tomar enquanto o socorro não chega."
    )

    add_p(
        "A ideia deste projeto nasceu das conversas e observações que tivemos durante atividades da Semana do Meio Ambiente e visitas a campo em Araçoiaba da Serra. Ao conversarmos com moradores, estudantes e observadores da natureza no município, percebemos dois pontos centrais: a comunidade tem grande interesse e curiosidade sobre a fauna local, mas a cidade e os cidadãos enfrentam dificuldades práticas para registrar esses avistamentos e acionar ajuda especializada, pois as informações permanecem dispersas em relatos informais nas redes sociais ou anotações isoladas, sem registro geográfico exato. Isso impede o mapeamento consistente de onde as espécies mais aparecem e quais trechos demandam atenção preventiva."
    )

    add_p(
        "Com base nesse cenário, este trabalho tem como objetivo desenvolver o Fauna da Serra, uma plataforma web colaborativa e simples de usar, voltada para catalogar, monitorar e registrar ocorrências da fauna silvestre em Araçoiaba da Serra e região. Apoiada nos conceitos de Ciência Cidadã, a proposta permite que qualquer munícipe utilize o próprio celular para fotografar o animal, registrar o local pelo GPS e receber orientações claras de convivência. Ao mesmo tempo, as informações consolidadas geram uma base aberta e confiável sobre a biodiversidade regional, facilitando o acionamento rápido de canais de socorro (como Defesa Civil e Polícia Ambiental) para animais feridos e apoiando estudos de conservação ambiental."
    )

    # ==========================================
    # 2 DESENVOLVIMENTO
    # ==========================================
    add_h1("2 DESENVOLVIMENTO")

    add_h2("2.1 Objetivos")

    add_p("Objetivo Geral", bold=True, space_after=4)
    add_p(
        "Desenvolver e avaliar o Fauna da Serra, uma plataforma web colaborativa, simples e acessível para o registro, monitoramento georreferenciado e divulgação educativa da fauna silvestre no município de Araçoiaba da Serra e região, promovendo a conservação da biodiversidade regional por meio da ciência cidadã."
    )

    add_p("Objetivos Específicos", bold=True, space_after=4)
    add_p("Para cumprir o objetivo geral, definimos etapas de trabalho divididas em três frentes complementares:")

    add_p("Objetivos Exploratórios:", bold=True, space_after=2)
    for txt in [
        "Identificar as espécies de animais silvestres que aparecem com maior frequência nas áreas urbanas, periurbanas e rurais de Araçoiaba da Serra e entorno, combinando relatos de moradores, observações de campo e dados de ocorrências na região;",
        "Levantar as principais dúvidas, dificuldades e receios da população local ao se deparar com animais silvestres em suas propriedades ou ao tentar acionar serviços públicos de emergência;",
        "Descobrir pontos recorrentes de conflito entre a malha viária e a fauna, como trechos de estradas com histórico de atropelamento e bairros próximos a áreas de mata com frequente entrada de animais."
    ]:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(txt)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)

    add_p("Objetivos Descritivos:", bold=True, space_after=2)
    for txt in [
        "Caracterizar os requisitos técnicos e funcionais para que a aplicação web funcione de forma leve e responsiva em celulares (PWA), permitindo capturar coordenadas de GPS, anexar fotos e funcionar com estabilidade mesmo em locais com sinal de internet oscilante;",
        "Descrever e aplicar boas práticas de acessibilidade digital alinhadas às diretrizes do WCAG 2.1 (nível AA), permitindo que pessoas com deficiência visual ou motora, bem como cidadãos de qualquer faixa etária, consigam utilizar o sistema com facilidade;",
        "Traçar um fluxo seguro de triagem e curadoria, onde estudantes, biólogos e pesquisadores voluntários possam conferir as fotos, verificar a identificação taxonômica da espécie e validar os dados antes da publicação no mapa público."
    ]:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(txt)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)

    add_p("Objetivos Explicativos:", bold=True, space_after=2)
    for txt in [
        "Analisar como o uso de uma ferramenta aberta de ciência cidadã desperta o sentimento de cuidado e responsabilidade ecológica entre estudantes e moradores participantes;",
        "Verificar de que forma a substituição de anotações esparsas por um mapa com dados georreferenciados melhora a velocidade no acionamento de serviços de emergência (Defesa Civil, Bombeiros e Polícia Ambiental) e disponibiliza uma base espacial aberta para estudos de conservação da biodiversidade regional;",
        "Avaliar a recepção e a usabilidade do protótipo inicial por meio de testes práticos com a comunidade de Araçoiaba da Serra, colhendo opiniões para aperfeiçoar a solução final."
    ]:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(txt)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)

    # 2.2 Justificativa
    add_h2("2.2 Justificativa e delimitação do problema")

    add_p(
        "O convívio diário entre cidades em expansão e áreas de mata nativa traz desafios práticos para a sustentabilidade e a segurança pública. Em Araçoiaba da Serra, cidade rodeada por vegetação nativa e vizinha da Floresta Nacional de Ipanema, o avanço de loteamentos residenciais e o tráfego de veículos nas estradas vicinais reduzem os espaços naturais. Por causa disso, espécies silvestres (como capivaras, saruês, tucanos, quatis, tamanduás e diversas serpentes) acabam transitando por ruas, quintais e rodovias de acesso em busca de água, alimento ou novos abrigos."
    )

    add_p(
        "Apesar de esses encontros acontecerem todos os dias, a região enfrenta uma lacuna na sistematização das informações: não existe um canal comunitário aberto e estruturado para catalogar avistamentos e orientar a população. Hoje em dia, quando um morador avista um animal no bairro, encontra um espécime ferido ou presencia um atropelamento, ele recorre a pedidos de socorro esparsos em redes sociais ou ligações telefônicas fragmentadas. Sem um registro com localização geográfica exata, fotografias anexadas e orientações preventivas imediatas, essas informações se perdem no dia a dia, e a população continua sem saber como agir adequadamente diante de cada espécie."
    )

    add_p("A partir dessa realidade observada em campo, definimos a seguinte pergunta de pesquisa para nortear o projeto:")

    add_quote_block(
        "De que maneira uma plataforma web colaborativa e georreferenciada, baseada nos preceitos da Ciência Cidadã, pode capacitar os moradores de Araçoiaba da Serra e região a registrarem ocorrências de fauna silvestre de forma rápida, promovendo o conhecimento coletivo sobre a biodiversidade e apoiando o acionamento eficiente de serviços públicos de socorro animal?"
    )

    add_p(
        "O trabalho concentra-se geograficamente no município de Araçoiaba da Serra, com foco nas áreas verdes públicas, nos parques da cidade e nos bairros mais próximos às faixas de mata e rodovias. No campo tecnológico, o foco é construir uma aplicação web moderna, leve e adaptada para celulares, voltada ao registro inicial, localização por GPS, educação ambiental e triagem de ocorrências, sem interferir no trabalho de atendimento médico veterinário realizado pelos órgãos competentes."
    )

    add_p("Relevância Social e Comunitária", bold=True, space_after=4)
    add_p(
        "Na parte social, o projeto ajuda a mudar a forma como as pessoas enxergam a fauna da cidade. Muitas vezes, a falta de informação faz com que moradores sintam medo injustificado de animais que não oferecem perigo real, como os saruês e pequenas serpentes inofensivas, levando a agressões e mortes desnecessárias de espécimes que são essenciais para o controle de pragas urbanas (como escorpiões e carrapatos). Ao oferecer um guia prático com fotos reais e dicas simples de como agir, a plataforma transforma o cidadão em um parceiro da conservação, valorizando a riqueza natural de Araçoiaba da Serra."
    )

    add_p("Relevância Acadêmica e Tecnológica", bold=True, space_after=4)
    add_p(
        "No curso de computação, este trabalho permite aplicar na prática conceitos fundamentais da engenharia de software voltados para resolver um problema real da sociedade: construção de uma aplicação web responsiva que funciona direto no navegador do celular, sem exigir instalações pesadas; modelagem de banco de dados relacional com extensões espaciais (PostGIS), permitindo armazenar coordenadas geográficas exatas e gerar consultas por proximidade e mapas de calor; aplicação rigorosa das diretrizes de Acessibilidade Digital (WCAG 2.1 nível AA), garantindo que idosos, crianças e pessoas com deficiência consigam usar os botões e ler as informações sem barreiras; e exercício dos conceitos de Ciência Cidadã, mostrando como a tecnologia pode ser usada para coletar dados científicos com a ajuda voluntária dos próprios cidadãos."
    )

    add_p("Contribuições Práticas para a Comunidade e a Conservação Regional", bold=True, space_after=4)
    add_p(
        "Para a comunidade e para as entidades que atuam no socorro à fauna (como a Defesa Civil, o Corpo de Bombeiros e a Polícia Militar Ambiental), a plataforma traz benefícios operacionais e informativos imediatos: agilidade nos casos urgentes, já que chamados com animais feridos destacam os canais de socorro por discagem direta (click-to-call) e geram dados precisos de GPS e foto para direcionar a equipe de resgate; estruturação de dados abertos, substituindo anotações dispersas por uma base de dados digital e padronizada; e subsídios para prevenção e conservação, fornecendo a pesquisadores, educadores e coletivos ambientais dados concretos para propor ações preventivas e planejar corredores ecológicos."
    )

    # 2.3 Fundamentação Teórica
    add_h2("2.3 Fundamentação teórica")

    add_p(
        "O embasamento teórico que dá sustentação a este projeto está estruturado em três eixos principais: (a) a aplicação da Ciência Cidadã na conservação ambiental; (b) o impacto da expansão urbana sobre a fauna silvestre em municípios do interior paulista; e (c) o uso de frameworks web modernos, sistemas de informação geográfica e diretrizes de acessibilidade digital no desenvolvimento de softwares de utilidade pública."
    )

    add_h3("2.3.1 Ciência Cidadã e Monitoramento Participativo da Biodiversidade")
    add_p(
        "A Ciência Cidadã (ou Citizen Science) baseia-se na colaboração ativa entre a população em geral e os pesquisadores científicos. Nessa dinâmica, cidadãos comuns atuam como voluntários na coleta de dados, no envio de observações fotográficas de campo e no acompanhamento de fenômenos naturais. De acordo com Bonney et al. (2009), a popularização dos smartphones equipados com câmeras de alta resolução e sensores de localização via satélite transformou o alcance desse tipo de projeto, tornando possível monitorar grandes áreas territoriais de forma contínua, algo inviável caso dependesse unicamente de pequenas equipes técnicas em campo."
    )
    add_p(
        "Na área ambiental, essa participação coletiva funciona como uma rede de apoio distribuída. Quando um munícipe fotografa um bicho no quintal ou na beira da estrada e registra a coordenada do local, ele produz um dado biológico inicial. Após passar pela conferência de um especialista, esse registro torna-se uma informação valiosa para pesquisadores e órgãos públicos. Conforme destaca Silvertown (2009):"
    )
    add_quote_block(
        "A ciência cidadã não apenas democratiza o fazer científico ao aproximar a sociedade da produção de conhecimento empírico, mas também fornece subsídios fundamentais para que ecologistas e gestores públicos acompanhem mudanças na distribuição de espécies, identifiquem espécies invasoras e compreendam os impactos da fragmentação de habitats provocada pela urbanização acelerada.",
        "(SILVERTOWN, 2009, p. 467)."
    )
    add_p(
        "No Brasil, já existem iniciativas de sucesso baseadas nesse modelo colaborativo. O WikiAves, amplamente utilizado por observadores de pássaros, e o Sistema de Informação sobre a Biodiversidade Brasileira (SiBBr), coordenado pelo Ministério da Ciência, Tecnologia e Inovação (MCTI, 2021), mostram que a cooperação cidadã permite formar acervos ricos e organizados em padrões abertos, como o Darwin Core. Da mesma forma, o Sistema de Informação em Saúde Silvestre (SISS-Geo), desenvolvido pela Fundação Oswaldo Cruz (FIOCRUZ, 2018), utiliza fotos e relatos enviados pelo público para identificar animais doentes ou mortos, permitindo que as autoridades de saúde e meio ambiente ajam preventivamente."
    )

    add_h3("2.3.2 Fragmentação de Habitats e a Fauna Silvestre em Áreas Periurbanas")
    add_p(
        "Quando as cidades crescem sem planejamento ecológico, a abertura de ruas, condomínios e áreas industriais acaba dividindo as matas contínuas em pequenos fragmentos isolados. Esse processo de fragmentação florestal dificulta a movimentação natural dos animais, isola pequenos grupos da mesma espécie e reduz as chances de reprodução saudável (METZGER, 2001)."
    )
    add_p(
        "No caso de Araçoiaba da Serra e das cidades vizinhas (Sorocaba, Capela do Alto e Iperó), a proximidade com a Floresta Nacional de Ipanema (Flona de Ipanema) torna a preservação da fauna ainda mais urgente. A Flona abriga centenas de espécies nativas, incluindo animais vulneráveis ou ameaçados de extinção, como a onça-parda (Puma concolor), o lobo-guará (Chrysocyon brachyurus), a jaguatirica (Leopardus pardalis) e o tamanduá-bandeira (Myrmecophaga tridactyla), além de mamíferos que se adaptaram muito bem às margens das cidades, como a capivara (Hydrochoerus hydrochaeris) e o saruê (Didelphis albiventris) (ICMBio, 2019)."
    )
    add_p(
        "Bencke et al. (2006) explicam que muitas espécies utilizam as matas ciliares que margeiam rios e pequenos bosques urbanos como caminhos temporários (corredores ecológicos) para buscar comida ou refúgio. No entanto, quando esses caminhos são cortados por estradas asfaltadas ou muros de propriedades, ocorrem atropelamentos constantes e animais acabam encurralados em residências:"
    )
    add_quote_block(
        "Os impactos das vias de tráfego sobre a fauna silvestre transcendem a mortalidade direta causada pelos atropelamentos; as estradas atuam como barreiras físicas e comportamentais severas, fragmentando populações, alterando padrões de deslocamento e induzindo conflitos frequentes na interface urbano-rural.",
        "(BENCKE et al., 2006, p. 34)."
    )
    add_p(
        "Por essa razão, contar com uma ferramenta computacional que aponte com precisão geográfica onde esses animais estão sendo vistos ou onde ocorrem acidentes fornece subsídios fundamentais para que a sociedade civil, pesquisadores e órgãos competentes tomem decisões práticas, como a colocação de placas sinalizadoras, a indicação de passagens de fauna e o plantio de árvores conectando as áreas verdes."
    )

    add_h3("2.3.3 Tecnologias Web, Dados Espaciais e Acessibilidade Digital")
    add_p(
        "Para que uma plataforma de ciência cidadã funcione bem na prática, ela precisa ser extremamente amigável ao usuário comum e ao mesmo tempo confiável no armazenamento de dados de localização. Sob a ótica do desenvolvimento de software, a utilização de uma aplicação web responsiva do tipo Progressive Web App (PWA) permite que o cidadão acesse o sistema direto no navegador do celular, com carregamento rápido e sem ter que baixar aplicativos pesados nas lojas virtuais (SILVA, 2022)."
    )
    add_p(
        "Na camada de banco de dados, os sistemas tradicionais encontram limites quando precisamos fazer contas geográficas, como calcular distâncias entre dois pontos ou saber se uma ocorrência está dentro dos limites de um parque. Por isso, a combinação do banco de dados relacional PostgreSQL com a extensão espacial PostGIS é a mais recomendada. O PostGIS permite guardar geometrias no padrão geodésico mundial WGS84 e efetuar consultas espaciais de alta performance utilizando índices vetoriais especializados (GiST) (DAVIS, 2021). No navegador do usuário, mapas leves em código aberto como o Leaflet.js, alimentados por dados do OpenStreetMap, viabilizam a navegação e a exibição de pontos e mapas de calor com custo zero de licença."
    )
    add_p(
        "Por fim, como o sistema é voltado para toda a comunidade, a acessibilidade digital é uma exigência indispensável. De acordo com a Cartilha de Acessibilidade na Web do W3C Brasil (2014), sistemas públicos devem seguir as diretrizes do Web Content Accessibility Guidelines (WCAG 2.1), organizando-se em quatro princípios fundamentais:"
    )
    add_quote_block(
        "Para que uma aplicação web seja genuinamente inclusiva, o conteúdo e a interface devem ser: perceptíveis, de modo que as informações sejam compreensíveis por meio de diferentes sentidos; operáveis, permitindo a navegação completa sem dependência exclusiva do mouse; compreensíveis, apresentando linguagem clara e operação previsível; e robustos, possibilitando a interpretação fidedigna por uma ampla variedade de tecnologias assistivas, incluindo leitores de tela para pessoas com deficiência visual.",
        "(W3C BRASIL, 2014, p. 18)."
    )

    # 2.4 Metodologia
    add_h2("2.4 Metodologia")
    add_p(
        "A metodologia adotada para o desenvolvimento deste Projeto Integrador baseia-se nos princípios do Design Thinking, metodologia ativa recomendada pela UNIVESP, combinada com práticas de levantamento de requisitos e prototipação ágil de software. Essa escolha metodológica permitiu que o grupo conhecesse de perto a realidade do município e as necessidades reais da população antes de começar a implementação de qualquer componente de código. O trabalho organizou-se em três etapas consecutivas: Ouvir e Interpretar o Contexto, Criar / Prototipar e Implementar / Testar."
    )

    add_h3("2.4.1 Ouvir e Interpretar o Contexto")
    add_p(
        "A primeira etapa do trabalho concentrou-se no contato direto com a comunidade e com os locais de estudo. Escolhemos o município de Araçoiaba da Serra a partir da oportunidade gerada pelas ações educativas realizadas durante a Semana do Meio Ambiente, promovida no município em conjunto com escolas e membros da comunidade local."
    )
    add_p(
        "Durante os encontros e visitas de campo, o grupo conversou com três grupos de pessoas: (1) Estudantes da Rede Básica e Jovens da Cidade, que relataram avistar animais com frequência perto da escola ou no caminho de casa, demonstrando curiosidade pelas espécies, mas também receio por não saberem se o bicho oferecia perigo; (2) Moradores de Bairros Próximos a Áreas Verdes, que convivem com a presença de animais em seus quintais (principalmente gambás e serpentes) ou que já presenciaram atropelamentos de capivaras e corujas nas vias de ligação da cidade; e (3) Agentes Locais de Apoio Comunitário e Voluntários da Causa Animal, que acompanham o socorro inicial a animais feridos e relataram a carência de um canal público e ágil para registrar fotos e coordenadas precisas de localização."
    )
    add_p(
        "Para coletar essas informações preliminares, combinamos três procedimentos: observação de campo, com acompanhamento presencial das palestras e atividades ao ar livre da Semana do Meio Ambiente; entrevistas qualitativas abertas com moradores, sitiantes e voluntários para entender como lidam ao encontrar um animal em risco; e levantamento de requisitos de campo, identificando os dados essenciais para o registro de avistamentos (data, horário aproximado, espécie provável, endereço ou coordenadas de GPS e condição de saúde do animal)."
    )

    add_h3("2.4.2 Criar e Prototipar")
    add_p(
        "A partir das necessidades colhidas na etapa anterior, a equipe reuniu-se para categorizar os problemas e estruturar as funcionalidades da plataforma. Ficou evidente que a solução precisava atender a dois perfis com necessidades distintas: o perfil do cidadão, demandando telas limpas sem cadastros demorados em momentos de emergência, com captura automática do ponto de GPS e envio de fotos; e o perfil de curadoria e pesquisa, com interface voltada a estudantes e pesquisadores contendo listagem de ocorrências, mapa interativo, verificação taxonômica das espécies e relatórios com dados abertos."
    )
    add_p(
        "Com base nesses requisitos, o grupo produziu artefatos de prototipação: desenho do fluxo de navegação do usuário; wireframes das telas principais (Página Inicial, Formulário de Avistamento, Canal de Emergência e Catálogo de Espécies), aplicando regras de acessibilidade WCAG 2.1 (nível AA) para garantir contraste adequado e botões confortáveis ao toque; e modelagem do banco de dados relacional com PostGIS para gravação precisa das coordenadas geográficas."
    )

    add_h3("2.4.3 Implementar e Testar")
    add_p(
        "Na terceira etapa, correspondente ao encerramento deste Relatório Parcial, o grupo iniciou a construção do protótipo preliminar e planejou a coleta de opiniões sobre a solução. O protótipo das telas foi apresentado em reunião de orientação acadêmica com o orientador Pedro Ariston Costa Pessoa e em simulações de uso com moradores de Araçoiaba da Serra."
    )
    add_p(
        "Os testes preliminares trouxeram contribuições importantes que guiarão a continuidade do desenvolvimento nos próximos meses: redução da quantidade de campos obrigatórios no envio para agilizar o registro antes que o animal fuja; adição de uma visualização acessível em formato de lista simples com alto contraste; e implementação de salvamento local (offline) para que fotos tiradas em áreas sem sinal fiquem salvas e sejam transmitidas quando a conexão retornar."
    )

    # 2.5 Resultados Preliminares
    add_h2("2.5 Resultados preliminares: solução inicial")
    add_p(
        "A aplicação das três etapas do Design Thinking durante esta primeira metade do projeto resultou na estruturação do Fauna da Serra, uma plataforma colaborativa de Ciência Cidadã para monitoramento da biodiversidade regional. Este capítulo apresenta as informações consolidadas a partir do trabalho de campo em Araçoiaba da Serra e demonstra visualmente a solução inicial construída pelo grupo."
    )

    add_h3("2.5.1 Resultados da Etapa Ouvir e Interpretar")
    add_p(
        "As conversas com os moradores e as visitas aos bairros e áreas verdes da região permitiram organizar as principais necessidades da comunidade, conforme resumido no Quadro 1:"
    )

    add_p("Quadro 1 - Síntese das necessidades identificadas junto à comunidade externa", bold=True, size=11, space_after=4)

    # Criar Tabela bonita para o Quadro 1
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(1.8), Inches(2.3), Inches(2.3)]
    hdr_cells = table.rows[0].cells
    hdr_titles = ["Grupo de Pessoas", "Dificuldade Encontrada", "Como o Sistema Resolve"]
    for i, title in enumerate(hdr_titles):
        hdr_cells[i].text = title
        hdr_cells[i].paragraphs[0].runs[0].font.name = 'Times New Roman'
        hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(10)
        hdr_cells[i].paragraphs[0].runs[0].bold = True
        set_cell_background(hdr_cells[i], "E1EFE8") # Verde floresta claro
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
        hdr_cells[i].width = col_widths[i]

    row_data = [
        ("Moradores e Famílias", "Dificuldade para saber se um animal visto no quintal é perigoso (ex.: diferenciar falsa-coral de coral verdadeira ou saruê de rato comum).", "Criação de um Guia de Espécies regional com fotos reais, nomes populares e dicas claras de convivência."),
        ("Pessoas que encontram animais feridos", "Desconhecimento de qual telefone ligar ou que atitudes tomar para proteger o animal sem se machucar.", "Disponibilização de uma aba de Emergência com orientações passo a passo e botões de chamada rápida para os serviços de socorro (Defesa Civil, Bombeiros e Polícia Ambiental)."),
        ("Estudantes e Cidadãos em Geral", "Vontade de registrar e compartilhar fotos de animais que veem nos parques e no caminho da escola.", "Formulário para celulares com envio simples de fotos e captura automática do ponto pelo GPS do aparelho."),
        ("Pesquisadores e Comunidade Local", "Registros de fauna dispersos em redes sociais ou anotações isoladas, sem localização geográfica exata no mapa.", "Base de dados aberta com tecnologia geoespacial (PostGIS), histórico dos avistamentos e relatórios analíticos.")
    ]

    for grupo, dif, sol in row_data:
        row_cells = table.add_row().cells
        for idx, text in enumerate([grupo, dif, sol]):
            row_cells[idx].text = text
            row_cells[idx].paragraphs[0].runs[0].font.name = 'Times New Roman'
            row_cells[idx].paragraphs[0].runs[0].font.size = Pt(9.5)
            row_cells[idx].width = col_widths[idx]
            set_cell_margins(row_cells[idx], top=100, bottom=100, left=150, right=150)

    p_fonte = doc.add_paragraph()
    p_fonte.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_fonte.paragraph_format.space_before = Pt(4)
    p_fonte.paragraph_format.space_after = Pt(14)
    r_f = p_fonte.add_run("Fonte: Elaborado pelos autores (2026).")
    r_f.font.name = 'Times New Roman'
    r_f.font.size = Pt(10)
    r_f.italic = True

    add_h3("2.5.2 Resultados da Etapa Criar: Arquitetura e Catálogo Regional")
    add_p(
        "A partir de consultas bibliográficas sobre a fauna da Floresta Nacional de Ipanema e relatos de moradores de Araçoiaba da Serra, mapeamos dez espécies nativas representativas para compor a base inicial do sistema: Capivara (Hydrochoerus hydrochaeris), Saruê/Gambá (Didelphis albiventris), Quati (Nasua nasua), Sagui-do-tufo-preto (Callithrix penicillata), Tamanduá-bandeira (Myrmecophaga tridactyla), Onça-parda (Puma concolor), Tucano-toco (Ramphastos toco), Coruja-buraqueira (Athene cunicularia), Carcará (Caracara plancus) e Teiú (Salvator merianae)."
    )

    add_h3("2.5.3 Demonstração Visual da Solução Inicial (Storyboard e Protótipos de Telas)")
    add_p(
        "Para ilustrar o funcionamento do protótipo no dia a dia, elaboramos um Storyboard que descreve passo a passo o que acontece quando um morador utiliza o sistema em campo:"
    )

    storyboard_text = (
        "PASSO 1: O ENCONTRO - O morador caminha perto de uma área verde de Araçoiaba da Serra e avista uma capivara descansando na margem do lago.\n\n"
        "PASSO 2: ACESSO À PLATAFORMA NO CELULAR - Pelo navegador do smartphone, o cidadão acessa o portal 'Fauna da Serra - Araçoiaba da Serra e Região' e clica no botão principal 'Registrar Avistamento Agora'.\n\n"
        "PASSO 3: FORMULÁRIO RÁPIDO COM GPS ATIVO - A câmera é acionada para capturar a fotografia; simultaneamente, o sensor do celular obtém as coordenadas geográficas exatas (-23.5186, -47.6138); o usuário seleciona a condição do animal ('Saudável') e a espécie sugerida ('Capivara').\n\n"
        "PASSO 4: CONFIRMAÇÃO EDUCATIVA E ENCAMINHAMENTO - O morador recebe confirmação com número de protocolo ('ARA-2026-0012') e uma dica educativa de conservação. Caso o animal estivesse ferido, a tela direciona imediatamente aos botões de discagem rápida para Defesa Civil (199), Bombeiros (193) ou Polícia Ambiental (190) com as coordenadas exatas para orientar o resgate."
    )

    add_quote_block(storyboard_text)

    add_p(
        "Para materializar os requisitos mapeados e o fluxo conceitual do Storyboard, o grupo desenvolveu um protótipo funcional de alta fidelidade da plataforma Fauna da Serra utilizando o framework Next.js 14, estilização utilitária com Tailwind CSS e componentes da biblioteca shadcn/ui. As figuras a seguir ilustram as cinco principais interfaces construídas para a versão preliminar da solução:"
    )

    # Definir caminhos das imagens
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    screenshots_dir = os.path.join(base_dir, "screenshots")
    img_home = os.path.join(screenshots_dir, "proto_figura1_home.png")
    img_carousel = os.path.join(screenshots_dir, "proto_figura2_carousel.png")
    img_registro = os.path.join(screenshots_dir, "proto_figura3_registro.png")
    img_mobile = os.path.join(screenshots_dir, "proto_figura4_mobile.png")
    img_emergencias = os.path.join(screenshots_dir, "proto_figura5_emergencias.png")

    # 1. Tela Inicial
    add_p(
        "A tela inicial (Figura 1) foi pensada para acolher o morador e despertar interesse imediato pela fauna da cidade. No topo, incluímos o novo logotipo temático com a pegada de animal silvestre e a identificação do projeto. Ao fundo, uma esteira panorâmica com fotos reais de animais de Araçoiaba da Serra e da Flona de Ipanema desliza continuamente. No centro, um cartão translúcido dá as boas-vindas e oferece atalhos diretos para registrar um animal, pedir socorro em emergências ou navegar pelo catálogo de espécies.",
        space_after=4
    )
    add_figure(
        img_home,
        "Figura 1 - Tela Inicial da plataforma com carrossel dinâmico em segundo plano e acesso rápido aos serviços",
        width=Inches(5.8)
    )

    # 2. Fauna em Destaque (Carrossel)
    add_p(
        "Logo abaixo da abertura, a seção Fauna em Destaque (Figura 2) traz um carrossel navegável pelas setas laterais, usando o componente Carousel da biblioteca shadcn/ui. O visitante pode folhear facilmente as dez espécies catalogadas, conferindo fotos nítidas, nomes populares, família biológica e o estado de conservação de cada bicho (classificação IUCN). Esse formato serve como um miniguia prático para consultas rápidas no dia a dia.",
        space_after=4
    )
    add_figure(
        img_carousel,
        "Figura 2 - Seção Fauna em Destaque com carrossel interativo de espécies nativas de Araçoiaba da Serra",
        width=Inches(5.8)
    )

    # 3. Formulário de Registro
    add_p(
        "O formulário de avistamento (Figura 3) é o coração da Ciência Cidadã no sistema. O morador pode tirar a foto na hora ou enviar da galeria, indicar se o animal está saudável, machucado ou morto, e marcar onde o encontrou. O sistema lê as coordenadas de GPS do celular e traz uma lista de locais conhecidos da cidade (Lago Municipal, Flona de Ipanema, Jundiaquara, Centro, Cercado, etc.), permitindo escolher o ponto exato mesmo se o GPS do aparelho estiver oscilando.",
        space_after=4
    )
    add_figure(
        img_registro,
        "Figura 3 - Formulário de Registro de Ocorrência com seleção de pontos georreferenciados e detecção por GPS",
        width=Inches(3.8)
    )

    # 4. Responsividade Mobile
    add_p(
        "Como a maioria dos avistamentos acontece na rua, em passeios ou na beira de estradas rurais, projetamos a plataforma pensando primeiro no celular (Figura 4). Todas as telas foram ajustadas para smartphones (a partir de 390px de largura), com botões confortáveis ao toque (mínimo de 44px), textos fáceis de ler ao ar livre e organização em coluna única para permitir o uso com apenas uma mão.",
        space_after=4
    )
    add_figure(
        img_mobile,
        "Figura 4 - Interface responsiva mobile adaptada para uso em campo via smartphone (390px)",
        width=Inches(2.6)
    )

    # 5. Central de Emergências
    add_p(
        "Para situações de animais machucados ou em risco, criamos uma página exclusiva de emergências (Figura 5). A tela destaca dicas básicas de segurança (manter distância, afastar cães e gatos e não tentar alimentar o animal) e traz botões de ligação rápida (click-to-call) para a Defesa Civil (199), o Corpo de Bombeiros (193) e a Polícia Militar Ambiental (190), encurtando o tempo necessário para pedir ajuda.",
        space_after=4
    )
    add_figure(
        img_emergencias,
        "Figura 5 - Central de Emergências com orientações de resgate e discagem telefônica direta (click-to-call)",
        width=Inches(5.8)
    )

    add_h3("2.5.4 Resultados da Etapa Implementar e Testar: Retorno Preliminar")
    add_p(
        "Apresentamos o protótipo inicial para moradores de Araçoiaba da Serra e para o orientador do trabalho. Os comentários recebidos foram muito positivos, destacando os seguintes aspectos: facilidade no envio, sem cadastros burocráticos obrigatórios; relevância dos telefones da Defesa Civil e instruções do que não fazer ao encontrar animais silvestres; e sugestões para incorporar filtros simplificados por silhueta de animal para facilitar o uso por crianças e idosos na versão final do projeto."
    )

    # ==========================================
    # REFERÊNCIAS
    # ==========================================
    doc.add_page_break()
    add_h1("REFERÊNCIAS")

    referencias = [
        "ABNT - ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: Informação e documentação: Trabalhos acadêmicos - Apresentação. Rio de Janeiro: ABNT, 2011.",
        "ABNT - ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: Informação e documentação: Referências - Elaboração. Rio de Janeiro: ABNT, 2018.",
        "ABNT - ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 10520: Informação e documentação: Citações em documentos - Apresentação. Rio de Janeiro: ABNT, 2023.",
        "BENCKE, G. A. et al. Áreas importantes para a conservação das aves no Brasil: parte I - Estados do domínio da Mata Atlântica. São Paulo: SAVE Brasil, 2006.",
        "BONNEY, R. et al. Citizen Science: a developing tool for expanding science knowledge and scientific literacy. BioScience, v. 59, n. 11, p. 977-984, 2009.",
        "DAVIS, R. PostGIS in Action. 3. ed. Shelter Island: Manning Publications, 2021.",
        "FIOCRUZ - FUNDAÇÃO OSWALDO CRUZ. Sistema de Informação em Saúde Silvestre (SISS-Geo): manual de operação e monitoramento colaborativo. Rio de Janeiro: Fiocruz, 2018. Disponível em: <http://www.sissgeo.fiocruz.br>. Acesso em: 15 set. 2026.",
        "GIL, A. C. Como elaborar projetos de pesquisa. 6. ed. São Paulo: Atlas, 2019.",
        "ICMBIO - INSTITUTO CHICO MENDES DE CONSERVAÇÃO DA BIODIVERSIDADE. Plano de Manejo da Floresta Nacional de Ipanema. Iperó: ICMBio/MMA, 2019. Disponível em: <https://www.gov.br/icmbio/pt-br>. Acesso em: 16 set. 2026.",
        "MCTI - MINISTÉRIO DA CIÊNCIA, TECNOLOGIA E INOVAÇÃO. Sistema de Informação sobre a Biodiversidade Brasileira (SiBBr). Brasília: MCTI, 2021. Disponível em: <https://www.sibbr.gov.br>. Acesso em: 15 set. 2026.",
        "METZGER, J. P. O que é ecologia de paisagens? Biota Neotropica, v. 1, n. 1, p. 1-9, 2001.",
        "SEVERINO, A. J. Metodologia do trabalho científico. 24. ed. rev. e atual. São Paulo: Cortez, 2016.",
        "SILVA, M. A. Desenvolvimento de Aplicações Web Progressivas (PWA) com Frameworks Modernos. São Paulo: Novatec, 2022.",
        "SILVERTOWN, J. A new dawn for citizen science. Trends in Ecology & Evolution, v. 24, n. 9, p. 467-471, 2009.",
        "W3C BRASIL - WORLD WIDE WEB CONSORTIUM. Cartilha de Acessibilidade na Web: Fascículo I - Introdução à Acessibilidade na Web. São Paulo: Comitê Gestor da Internet no Brasil (CGI.br), 2014. Disponível em: <https://www.w3c.br/pub/CWT/CartilhaCWT/cartilha-w3cbr-acessibilidade-web-fasciculo-I.html>. Acesso em: 17 set. 2026.",
        "W3C - WORLD WIDE WEB CONSORTIUM. Web Content Accessibility Guidelines (WCAG) 2.1. W3C Recommendation, 2018. Disponível em: <https://www.w3.org/TR/WCAG21/>. Acesso em: 17 set. 2026."
    ]

    for ref in referencias:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.0  # Espaçamento simples para referências
        p.paragraph_format.space_after = Pt(8)
        r = p.add_run(ref)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)

    # Salvar nos dois destinos: raiz e docs
    out_paths = ["Relatorio_Parcial_Preenchido.docx", "docs/Relatorio_Parcial_Preenchido.docx"]
    for p in out_paths:
        try:
            doc.save(p)
            print(f"Salvo com sucesso em: {p}")
        except PermissionError:
            print(f"AVISO: O arquivo '{p}' está aberto no Word. Feche o Word para atualizá-lo.")

if __name__ == "__main__":
    create_full_report()
