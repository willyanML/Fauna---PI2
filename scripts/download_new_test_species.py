import os
import json
import time
import urllib.request
import urllib.parse

DEST_DIR = os.path.join("public", "images", "fauna")
os.makedirs(DEST_DIR, exist_ok=True)

headers = {
    "User-Agent": "FaunaDaSerraBot/1.0 (UNIVESP Projeto Integrador Araçoiaba da Serra; projeto.fauna.univesp@gmail.com)"
}

SPECIES_TO_ADD = [
    {
        "id": "lobo-guara",
        "wiki": "Lobo-guará",
        "filename": "lobo-guara.jpg",
        "nomePopular": "Lobo-guará",
        "nomeCientifico": "Chrysocyon brachyurus",
        "grupo": "MAMIFERO",
        "statusConservacao": "VU",
        "ameacadaExtincao": True,
        "exibirNoCarrosselHome": True,
        "descricao": "Maior canídeo silvestre da América do Sul, caracterizado pelas pernas longas e pelagem avermelhada. Possui hábitos crepusculares e solitários, sendo fundamental na dispersão de frutos do cerrado.",
        "habitat": "Campos abertos, bordas de cerradão e remanescentes florestais no entorno do Morro do Araçoiaba.",
        "orientacoesConvivencia": "Animal tímido e inofensivo ao ser humano. Mantenha distância respeitosa, reduza a velocidade em estradas rurais e jamais deixe alimentos expostos."
    },
    {
        "id": "jaguatirica",
        "wiki": "Jaguatirica",
        "filename": "jaguatirica.jpg",
        "nomePopular": "Jaguatirica",
        "nomeCientifico": "Leopardus pardalis",
        "grupo": "MAMIFERO",
        "statusConservacao": "LC",
        "ameacadaExtincao": False,
        "exibirNoCarrosselHome": True,
        "descricao": "Felino de porte médio com pelagem amarelada marcada por ocelos escuros alongados. Ágil escaladora e excelente nadadora, tem hábitos predominantemente noturnos e carnívoros.",
        "habitat": "Fragmentos densos de Mata Atlântica e matas ciliares conectadas à Floresta Nacional de Ipanema.",
        "orientacoesConvivencia": "Não tente aproximação nem encurrale. Mantenha animais domésticos abrigados durante a noite e informe avistamentos à equipe ambiental."
    },
    {
        "id": "tamandua-mirim",
        "wiki": "Tamanduá-mirim",
        "filename": "tamandua-mirim.jpg",
        "nomePopular": "Tamanduá-mirim",
        "nomeCientifico": "Tamandua tetradactyla",
        "grupo": "MAMIFERO",
        "statusConservacao": "LC",
        "ameacadaExtincao": False,
        "exibirNoCarrosselHome": True,
        "descricao": "Conhecido pela pelagem dourada com mancha escura em formato de colete e cauda preênsil. Especialista em consumir cupins e formigas arbóreas, controlando populações de insetos.",
        "habitat": "Matas secundárias, capoeiras e pomares rurais arborizados no município.",
        "orientacoesConvivencia": "Possui garras curvas poderosas para defesa. Mantenha cães afastados para evitar ferimentos mútuos e deixe o animal seguir seu curso na vegetação."
    },
    {
        "id": "urubu-rei",
        "wiki": "Urubu-rei",
        "filename": "Urubu-rei",
        "nomePopular": "Urubu-rei",
        "nomeCientifico": "Sarcoramphus papa",
        "grupo": "AVE",
        "statusConservacao": "LC",
        "ameacadaExtincao": False,
        "exibirNoCarrosselHome": True,
        "descricao": "Ave de grande porte com envergadura de até 2 metros, cabeça nua com cores vibrantes e plumagem branca e preta. Realiza serviço ecossistêmico crucial ao decompor carcaças.",
        "habitat": "Florestas preservadas e paredões rochosos da serra com correntes de ar ascendentes.",
        "orientacoesConvivencia": "Espécie silvestre protegida. Evite perturbar locais de pouso ou ninhais nas encostas rochosas."
    }
]

print("1. Obtendo URLs das imagens via API Wikipedia e baixando localmente...")
for sp in SPECIES_TO_ADD:
    dest_path = os.path.join(DEST_DIR, sp["filename"])
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 30000:
        print(f" -> {sp['filename']} já existe ({os.path.getsize(dest_path)} bytes). Pulando download.")
        continue

    time.sleep(1.5)
    api_url = f"https://pt.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(sp['wiki'])}"
    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            img_url = data.get("originalimage", {}).get("source") or data.get("thumbnail", {}).get("source")
            print(f" -> {sp['nomePopular']}: baixando de {img_url}...")
            
            time.sleep(1.5)
            img_req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(img_req, timeout=20) as img_resp, open(dest_path, "wb") as f:
                content = img_resp.read()
                f.write(content)
            print(f"    OK! {sp['filename']} salvo ({len(content)} bytes)")
    except Exception as e:
        print(f"    ERRO ao baixar {sp['nomePopular']}: {e}")

print("\n2. Injetando novas espécies em src/data/conteudo_fauna.json...")
conteudo_path = os.path.join("src", "data", "conteudo_fauna.json")
if os.path.exists(conteudo_path):
    with open(conteudo_path, "r", encoding="utf-8") as f:
        dados = json.load(f)

    especies_existentes = {e["id"]: e for e in dados.get("especies", [])}
    carrossel_existente = {c["id"]: c for c in dados.get("carrossel", {}).get("itens", [])}

    for sp in SPECIES_TO_ADD:
        especies_existentes[sp["id"]] = {
            "id": sp["id"],
            "nomePopular": sp["nomePopular"],
            "nomeCientifico": sp["nomeCientifico"],
            "grupo": sp["grupo"],
            "statusConservacao": sp["statusConservacao"],
            "fotoReferenciaUrl": f"/images/fauna/{sp['filename']}",
            "descricao": sp["descricao"],
            "habitat": sp["habitat"],
            "orientacoesConvivencia": sp["orientacoesConvivencia"],
            "ameacadaExtincao": sp["ameacadaExtincao"],
            "exibirNoCarrosselHome": sp["exibirNoCarrosselHome"]
        }

        if sp["id"] not in carrossel_existente:
            carrossel_existente[sp["id"]] = {
                "id": sp["id"],
                "nome": sp["nomePopular"],
                "imagemUrl": f"/images/fauna/{sp['filename']}",
                "ativo": True,
                "ordem": len(carrossel_existente) + 1
            }

    dados["especies"] = list(especies_existentes.values())
    dados["carrossel"]["itens"] = list(carrossel_existente.values())

    # Adiciona ocorrências de teste para enriquecer a curadoria e galeria dos bairros
    ocorrencias_existentes = {o["id"]: o for o in dados.get("ocorrencias", [])}
    novas_ocorrencias = [
        {
            "id": "ocorr-lobo-guara-01",
            "protocolo": "ARA-2026-0015",
            "dataRegistro": "2026-04-18T19:30:00.000Z",
            "especieIdentificadaId": "lobo-guara",
            "especieSugeridaId": "lobo-guara",
            "bairro": "Morro do Araçoiaba (Estrada Rural)",
            "latitude": -23.5182,
            "longitude": -47.6150,
            "fotoUrl": "/images/fauna/lobo-guara.jpg",
            "statusValidacao": "VALIDADO",
            "aprovadoParaGaleria": True,
            "relato": "Lobo-guará avistado tranquilamente cruzando a estrada de terra ao entardecer em direção à mata.",
            "estadoSaude": "SAUDAVEL"
        },
        {
            "id": "ocorr-jaguatirica-01",
            "protocolo": "ARA-2026-0016",
            "dataRegistro": "2026-04-20T21:15:00.000Z",
            "especieIdentificadaId": "jaguatirica",
            "especieSugeridaId": "jaguatirica",
            "bairro": "Cercanias da Floresta Nacional de Ipanema",
            "latitude": -23.4990,
            "longitude": -47.6025,
            "fotoUrl": "/images/fauna/jaguatirica.jpg",
            "statusValidacao": "VALIDADO",
            "aprovadoParaGaleria": True,
            "relato": "Avistada caminhando na borda da cerca viva perto da reserva. Muito ágil.",
            "estadoSaude": "SAUDAVEL"
        },
        {
            "id": "ocorr-tamandua-mirim-01",
            "protocolo": "ARA-2026-0017",
            "dataRegistro": "2026-04-21T10:40:00.000Z",
            "especieIdentificadaId": "tamandua-mirim",
            "especieSugeridaId": "tamandua-mirim",
            "bairro": "Bairro Campo Meio",
            "latitude": -23.5085,
            "longitude": -47.6210,
            "fotoUrl": "/images/fauna/tamandua-mirim.jpg",
            "statusValidacao": "VALIDADO",
            "aprovadoParaGaleria": True,
            "relato": "Subindo em uma árvore no quintal, parecia estar se alimentando de formigas.",
            "estadoSaude": "SAUDAVEL"
        },
        {
            "id": "ocorr-urubu-rei-01",
            "protocolo": "ARA-2026-0018",
            "dataRegistro": "2026-04-22T14:10:00.000Z",
            "especieIdentificadaId": None,
            "especieSugeridaId": "urubu-rei",
            "bairro": "Encosta Rochosa da Serra",
            "latitude": -23.5320,
            "longitude": -47.6350,
            "fotoUrl": "/images/fauna/urubu-rei.jpg",
            "statusValidacao": "PENDENTE",
            "aprovadoParaGaleria": False,
            "relato": "Grande ave com cabeça colorida pousada no topo de um rochedo alto. Aguardando validação biológica.",
            "estadoSaude": "SAUDAVEL"
        }
    ]

    for oc in novas_ocorrencias:
        ocorrencias_existentes[oc["id"]] = oc

    dados["ocorrencias"] = list(ocorrencias_existentes.values())

    with open(conteudo_path, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

    print(f"Sucesso! Total de espécies agora: {len(dados['especies'])}, Total de carrossel: {len(dados['carrossel']['itens'])}, Total ocorrências: {len(dados['ocorrencias'])}")
