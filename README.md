# Fauna da Serra - Araçoiaba da Serra

Sistema web desenvolvido para o Projeto Integrador II da UNIVESP (Polo Araçoiaba da Serra - SP), com o objetivo de catalogar espécies da fauna silvestre local e permitir que moradores registrem avistamentos de animais no município.

## O que o projeto faz

Araçoiaba da Serra abriga áreas de Mata Atlântica e Cerrado, além da proximidade com a Floresta Nacional de Ipanema (FLONA). Por conta disso, é comum o avistamento de animais silvestres próximos de estradas, chácaras e bairros residenciais.

Este sistema foi criado para:
- Catalogar as espécies nativas da região com nome popular, científico e orientações de convivência e segurança.
- Permitir que os moradores enviem fotos e informações de animais avistados na cidade.
- Fornecer um painel de moderação para que os registros sejam revisados antes de aparecerem no site.
- Facilitar o contato rápido com órgãos de resgate (Polícia Ambiental, Defesa Civil e Bombeiros).

## Funcionalidades

### 1. Guia de Espécies
- Fichas com fotos, descrição, hábitos e status de conservação (ICMBio / IUCN).
- Busca rápida por nome que funciona mesmo sem acentos ou cedilha (ex: buscar "onca" encontra "Onça-parda").
- Recomendações de como agir ao encontrar cada animal e telefones úteis.

### 2. Envio de Ocorrências
- Formulário simples para moradores informarem o bairro, a data e enviarem uma foto do animal avistado.
- Redimensionamento e compressão automática da foto direto no navegador (usando Canvas) antes do envio, para não sobrecarregar o tráfego de dados nem o banco.

### 3. Painel de Administração (/admin)
- Login restrito para moderadores.
- Aba de curadoria para aprovar ou recusar fotos e relatos enviados pela comunidade.
- Cadastro, edição e exclusão de espécies cadastradas no catálogo.
- Gerenciamento das fotos que aparecem no carrossel da página inicial.

### 4. Acessibilidade
- Barra no topo do site para aumentar e diminuir o tamanho do texto.
- Modo de alto contraste para facilitar a leitura.
- Navegação adaptada para celulares e computadores.

## Tecnologias utilizadas

- Next.js 14 (App Router)
- React e TypeScript
- Tailwind CSS
- MongoDB Atlas (banco de dados)
- Vercel (hospedagem)

## Como rodar o projeto na sua máquina

### Pré-requisitos
- Node.js instalado (versão 18 ou superior)
- Git

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/willyanML/Fauna---PI2.git
cd Fauna---PI2
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as suas credenciais:
```env
MONGODB_URI=sua_url_do_mongodb
MONGODB_DB=fauna_db
ADMIN_USER=seu_usuario
ADMIN_PASSWORD=sua_senha
SESSION_SECRET=uma_chave_secreta_qualquer
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra o navegador em `http://localhost:3000`.

## Integrantes do Projeto

Projeto Integrador II - UNIVESP - Polo Araçoiaba da Serra - SP.
