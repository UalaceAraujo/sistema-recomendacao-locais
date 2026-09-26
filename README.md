# 📍 Sistema de Recomendação de Locais Baseado em Geolocalização (MyVicinity)

> **Trabalho de Conclusão de Curso (TCC)** apresentado ao Instituto de Ciências Exatas e Tecnologia da Universidade Paulista (UNIP) — Campus Araraquara/SP, como requisito para obtenção do título de Bacharel em Ciência da Computação (2026).

---

## 📖 Sobre o Projeto

O acelerado processo de urbanização trouxe desafios complexos para o planejamento urbano e para a escolha consciente de moradia e investimentos imobiliários. Frequentemente, a avaliação da infraestrutura de um bairro é feita de maneira empírica ou subjetiva, ou depende de softwares corporativos de Sistemas de Informação Geográfica (SIG) proprietários, complexos e de alto custo.

O **MyVicinity** é uma plataforma web interativa desenvolvida para democratizar e simplificar a análise espacial urbana. Utilizando dados abertos de Informação Geográfica Voluntária (*Volunteered Geographic Information* - VGI) do **OpenStreetMap**, a aplicação permite selecionar uma coordenada no mapa ou buscar por endereço para identificar, filtrar e quantificar Pontos de Interesse (POIs) — como hospitais, escolas, supermercados, farmácias, restaurantes, parques e transporte público — dentro de um raio delimitado. A partir de um algoritmo de pontuação ponderada espacial, o sistema gera uma nota objetiva (de 0 a 100) indicando a qualidade e a disponibilidade de serviços essenciais no entorno da localidade.

---

## 🎯 Objetivos

* **Objetivo Geral:** Desenvolver um sistema web interativo destinado à avaliação quantitativa das características do entorno de uma localização urbana por meio de dados geoespaciais abertos do OpenStreetMap, convertendo consultas espaciais em indicadores claros e objetivos de infraestrutura.
* **Mapeamento e Filtragem de POIs:** Estruturar consultas especializadas via **Overpass QL** para extrair pontos de interesse essenciais dentro do raio de abrangência.
* **Geocodificação Direta e Reversa:** Integrar a **Nominatim API** para conversão de endereços em coordenadas geográficas e vice-versa.
* **Algoritmo de Cálculo Espacial:** Processar de forma automatizada no backend as distâncias e quantidades de estabelecimentos para formulação do score urbano.
* **Visualização Cartográfica Dinâmica:** Proporcionar uma interface fluida com renderização do **Leaflet**, destacando locais, categorias e detalhamento interativo.

---

## 🚀 Funcionalidades Principais

- 🔍 **Busca Inteligente com Debounce:** Pesquisa preditiva de ruas, bairros e cidades com autocompletar via Nominatim.
- 🗺️ **Mapa Interativo (Leaflet):** Seleção direta de coordenadas no mapa com marcadores coloridos e categorizados para cada tipo de serviço.
- 📊 **Painel de Score Urbano:** Análise com nota geral ponderada e categorizada (*Excelente*, *Bom*, *Regular*, *Abaixo da média*, *Insuficiente*).
- 📑 **Detalhamento por Categoria:**
  - 🛒 Supermercados e Mercados
  - 💊 Farmácias
  - ❤️ Unidades de Saúde e Hospitais
  - 🎓 Educação (Escolas, Faculdades e Creches)
  - 🌳 Áreas de Lazer e Parques
  - 🍽️ Alimentação e Restaurantes
  - 🚌 Transporte Público
- 📌 **Destaque Visual de Estabelecimentos:** Ao clicar em um local listado no painel lateral, o mapa centraliza e ativa um marcador pulsante no ponto exato.
- 🌓 **Tema Claro e Escuro (Dark Mode):** Interface adaptável com alternância em tempo real.

---

## 🛠️ Tecnologias Utilizadas

### Frontend & Interface
* **[Next.js](https://nextjs.org/)** (App Router / React 19)
* **[TypeScript](https://www.typescriptlang.org/)** (Tipagem estática e segurança do código)
* **[Tailwind CSS v4](https://tailwindcss.com/)** (Estilização baseada em utilitários e paleta OKLCH)
* **[shadcn/ui](https://ui.shadcn.com/)** & **[Radix UI](https://www.radix-ui.com/)** (Componentes de acessibilidade e design de interface)
* **[Lucide React](https://lucide.dev/)** (Ícones visuais)
* **[Leaflet](https://leafletjs.com/)** (Renderização cartográfica de mapas interativos)

### Backend & Serviços Geoespaciais
* **Next.js API Routes** (Funções Serverless para intermediação e processamento)
* **[OpenStreetMap](https://www.openstreetmap.org/)** (Base de dados cartográfica aberta)
* **[Overpass API](https://overpass-api.de/)** (Extração e filtragem de POIs via Overpass QL)
* **[Nominatim API](https://nominatim.org/)** (Serviço de geocodificação direta e reversa)

---

## 📂 Estrutura do Projeto

```text
├── app/
│   ├── api/
│   │   ├── geocode/route.ts       # Comunicação com a Nominatim API
│   │   └── score/route.ts         # Consulta Overpass QL e cálculo do score
│   ├── globals.css                # Configurações do Tailwind CSS v4 e temas
│   ├── layout.tsx                 # Root Layout e provedor de metadados
│   └── page.tsx                   # Página principal que orquestra mapa e painel
├── components/
│   ├── address-search.tsx         # Campo de busca e geocodificação
│   ├── category-card.tsx          # Card de categoria com lista expansível
│   ├── location-map.tsx           # Componente do Leaflet com marcadores
│   ├── results-panel.tsx          # Painel lateral com resumo e pontuação
│   ├── score-display.tsx          # Visualizador circular da nota
│   └── theme-provider.tsx         # Provedor de temas (Dark/Light Mode)
├── lib/
│   └── utils.ts                   # Utilitários de classes CSS (cn)
├── public/                        # Ícones e recursos visuais estáticos
├── package.json                   # Dependências e scripts do projeto
└── tsconfig.json                  # Configuração do TypeScript
