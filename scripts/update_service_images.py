import re

path = 'src/lib/conteudo-service.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

wiki_map = {
    'Capivara%28Hydrochoerus_hydrochaeris%29': '/images/fauna/capivara.jpg',
    'Didelphis_albiventris': '/images/fauna/sarue.jpg',
    'South_American_coati': '/images/fauna/quati.jpg',
    'Toco_toucan': '/images/fauna/tucano-toco.jpg',
    'Callithrix_penicillata': '/images/fauna/sagui-tufo-preto.jpg',
    'Athene_cunicularia': '/images/fauna/coruja-buraqueira.jpg',
    'black_and_white_tegu': '/images/fauna/teiu.jpg',
    'Giant_anteater': '/images/fauna/tamandua-bandeira.jpg',
    'Puma_%28Puma_concolor': '/images/fauna/onca-parda.jpg',
    'Schopfkarakara': '/images/fauna/carcara.jpg',
}

for pattern, local_path in wiki_map.items():
    content = re.sub(r'https://thumb\.wikimedia\.org/[^"]*' + pattern + r'[^"]*', local_path, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Atualizado conteudo-service.ts com sucesso!')
