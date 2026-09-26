# - Sistema de Recomendação de Locais Baseado em Geolocalização

Trabalho de Conclusão de Curso (TCC) em Ciência da Computação.

 È uma plataforma web desenvolvida para analisar a conveniência urbana e a qualidade de localização de qualquer endereço ou coordenada geográfica. Utilizando dados abertos do OpenStreetMap (OSM) via Overpass API, o sistema calcula um índice de pontuação multicritério baseado na proximidade e densidade de serviços essenciais, como saúde, educação, transporte, alimentação, mercados e áreas de lazer.

---

## Tecnologias Utilizadas

- Framework Web: Next.js (App Router, React 19, TypeScript)
- Visualização Espacial: Leaflet e OpenStreetMap
- Estilização e Componentes: Tailwind CSS v4 e Shadcn UI
- Fonte de Dados Espaciais: OpenStreetMap via Overpass QL
- Geocodificação Direta: Nominatim API

---

## Principais Funcionalidades

- Busca Preditiva de Endereços: Autocompleta nomes de ruas, bairros e cidades com debounce otimizado.
- Seleção Dinâmica via Mapa: Permite clicar livremente em qualquer ponto do mapa para disparar a análise.
- Cálculo de Score Multicritério: Algoritmo ponderado por categorias de interesse e distância geodésica (Haversine).
- Inspeção de Pontos de Interesse (POIs): Detalhamento de locais próximos com foco interativo no mapa.

---

## Pré-requisitos e Execução Local

Certifique-se de ter o Node.js (v20+) e o pnpm instalados.

1. Clonar o repositório:
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   cd SEU-REPOSITORIO

2. Instalar as dependências:
   pnpm install

3. Iniciar o ambiente de desenvolvimento:
   pnpm dev

4. Acesse http://localhost:3000 no navegador.

---

## Colaboradores

- Integrantes da equipe de TCC
