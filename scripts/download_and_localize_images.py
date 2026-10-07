import os
import json
import urllib.request

DEST_DIR = os.path.join("public", "images", "fauna")
os.makedirs(DEST_DIR, exist_ok=True)

# Mapeamento das 10 espécies e suas URLs atuais
IMAGES_TO_DOWNLOAD = {
    "capivara.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Capivara%28Hydrochoerus_hydrochaeris%29.jpg/960px-Capivara%28Hydrochoerus_hydrochaeris%29.jpg",
    "sarue.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Didelphis_albiventris_-_Douglas_-_320276521.jpeg/960px-Didelphis_albiventris_-_Douglas_-_320276521.jpeg",
    "quati.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/068_South_American_coati_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg/960px-068_South_American_coati_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg",
    "tucano-toco.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/006_Toco_toucan_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg/960px-006_Toco_toucan_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg",
    "sagui-tufo-preto.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Callithrix_penicillata_-_Maroparque_01.jpg/960px-Callithrix_penicillata_-_Maroparque_01.jpg",
    "coruja-buraqueira.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Athene_cunicularia_-near_Goiania%2C_Goias%2C_Brazil-8_edit.jpg/960px-Athene_cunicularia_-near_Goiania%2C_Goias%2C_Brazil-8_edit.jpg",
    "teiu.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/182_Argentine_black_and_white_tegu_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg/960px-182_Argentine_black_and_white_tegu_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg",
    "tamandua-bandeira.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/037_Giant_anteater_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg/960px-037_Giant_anteater_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg",
    "onca-parda.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Puma_%28Puma_concolor_concolor%29_female_Leona_Amarga.jpg/960px-Puma_%28Puma_concolor_concolor%29_female_Leona_Amarga.jpg",
    "carcara.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Schopfkarakara.jpg/960px-Schopfkarakara.jpg"
}

headers = {
    "User-Agent": "FaunaDaSerraBot/1.0 (UNIVESP Projeto Integrador Araçoiaba da Serra; projeto.fauna.univesp@gmail.com)"
}

import time

print("1. Baixando imagens locais em public/images/fauna/...")
for filename, url in IMAGES_TO_DOWNLOAD.items():
    filepath = os.path.join(DEST_DIR, filename)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 50000:
        print(f"Arquivo {filename} já baixado ({os.path.getsize(filepath)} bytes). Pulando...")
        continue

    print(f"Baixando {filename}...")
    sucesso = False
    tentativas = 0
    while not sucesso and tentativas < 4:
        tentativas += 1
        req = urllib.request.Request(url, headers=headers)
        try:
            time.sleep(1.5)
            with urllib.request.urlopen(req, timeout=15) as resp, open(filepath, "wb") as f:
                data = resp.read()
                f.write(data)
            print(f"  -> Sucesso: {filename} ({len(data)} bytes)")
            sucesso = True
        except Exception as e:
            print(f"  -> Tentativa {tentativas} falhou ({filename}): {e}. Aguardando 3s...")
            time.sleep(3)

print("\n2. Atualizando src/data/conteudo_fauna.json...")
conteudo_path = os.path.join("src", "data", "conteudo_fauna.json")
if os.path.exists(conteudo_path):
    with open(conteudo_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Atualiza carrossel
    for item in data.get("carrossel", {}).get("itens", []):
        fn = f"{item['id']}.jpg"
        if fn in IMAGES_TO_DOWNLOAD:
            item["fotoUrl"] = f"/images/fauna/{fn}"

    # Atualiza espécies
    for esp in data.get("especies", []):
        fn = f"{esp['id']}.jpg"
        if fn in IMAGES_TO_DOWNLOAD:
            esp["fotoReferenciaUrl"] = f"/images/fauna/{fn}"

    # Atualiza ocorrências
    for ocorr in data.get("ocorrencias", []):
        esp_id = ocorr.get("especieSugeridaId")
        if esp_id:
            fn = f"{esp_id}.jpg"
            if fn in IMAGES_TO_DOWNLOAD:
                ocorr["fotoUrl"] = f"/images/fauna/{fn}"

    with open(conteudo_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("  -> conteudo_fauna.json atualizado com sucesso!")

print("\nConcluído com sucesso!")
