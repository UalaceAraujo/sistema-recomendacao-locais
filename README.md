# Sistema de Recomendação de Locais Baseado em Geolocalização

Trabalho de Conclusão de Curso (TCC) apresentado ao Instituto de Ciências Exatas e Tecnologia da Universidade Paulista (UNIP) — Campus Araraquara/SP, como requisito para a obtenção do título de Bacharel em Ciência da Computação (2026).

### Autores
* Anderson Sales de Oliveira
* Matheus Fantoni Grande
* Saulo Leal Zopelaro
* Ualace Araujo Serra
* Vinicius Gabriel Cerilo da Silva

### Orientadora
* Prof.ª Me. Francielle Mattos

---

## 1. Descrição do Projeto

O acelerado processo de urbanização trouxe desafios complexos para o planejamento urbano e para a tomada de decisões relativas à escolha de moradia e investimentos imobiliários. Frequentemente, a avaliação da infraestrutura de uma determinada área é realizada de forma empírica ou subjetiva, ou depende de softwares de Sistemas de Informação Geográfica (SIG) proprietários, complexos e associados a elevados custos de aquisição.

Este projeto propõe um sistema web interativo concebido para viabilizar e simplificar a análise espacial urbana. Utilizando dados abertos de Informação Geográfica Voluntária (*Volunteered Geographic Information* - VGI) provenientes do OpenStreetMap, a aplicação permite selecionar uma coordenada no mapa ou pesquisar um endereço para identificar, filtrar e quantificar Pontos de Interesse (POIs) — tais como unidades de saúde, instituições de ensino, supermercados, farmácias, restaurantes, áreas de lazer e pontos de transporte público — dentro de um raio de abrangência previamente definido. Com recurso a um algoritmo de pontuação ponderada espacial processado no servidor, o sistema atribui uma classificação objetiva (de 0 a 100) representativa da qualidade e disponibilidade dos serviços essenciais no entorno da localização consultada.

---

## 2. Objetivos

* **Objetivo Geral:** Desenvolver um sistema web interativo destinado à avaliação quantitativa das características do entorno de uma localização urbana através de dados geoespaciais abertos do OpenStreetMap, transformando consultas espaciais em indicadores mensuráveis de infraestrutura.
* **Mapeamento e Filtragem de POIs:** Estruturar consultas especializadas através da linguagem Overpass QL para extrair e filtrar pontos de interesse essenciais num raio pré-estabelecido.
* **Geocodificação Direta e Reversa:** Integrar a Nominatim API para a conversão de endereços em coordenadas geográficas e suporte à geocodificação reversa.
* **Algoritmo de Cálculo Espacial:** Implementar no backend o processamento das distâncias e volumes de estabelecimentos para gerar a métrica de pontuação ponderada.
* **Visualização Cartográfica:** Disponibilizar uma interface responsiva baseada na biblioteca Leaflet, renderizando marcadores, categorias e informações de apoio à navegação.

---

## 3. Principais Funcionalidades

* **Pesquisa de Endereço com Debounce:** Busca textual interativa com autocompletar e controle de requisições via Nominatim API.
* **Mapa Cartográfico Interativo:** Navegação, seleção direta de coordenadas geográficas no mapa e marcação visual categorizada por tipo de serviço.
* **Painel de Avaliação Urbana:** Cálculo da pontuação total ponderada acompanhada por classificações normativas (Excelente, Bom, Regular, Abaixo da média e Insuficiente).
* **Categorias de Serviços Analisadas:**
  * Supermercados e Mercados
  * Farmácias
  * Unidades de Saúde e Hospitais
  * Instituições de Ensino (Escolas, Faculdades e Creches)
  * Áreas Verdes e Lazer
  * Alimentação e Restaurantes
  * Transporte Público
* **Localização e Destaque:** Seleção individual de estabelecimentos na listagem lateral com reposicionamento automático do foco do mapa e abertura do marcador correspondente.
* **Alternância de Tema:** Suporte a modo visual claro e escuro integrado aos estilos globais do sistema.

---

## 4. Tecnologias Empregadas

### Frontend e Interface
* **Next.js:** Estrutura da aplicação e arquitetura cliente-servidor (App Router e React Server Components).
* **TypeScript:** Verificação estática de tipos e manutenibilidade do código-fonte.
* **Tailwind CSS v4:** Definição de estilos utilitários e paleta baseada no espaço de cores OKLCH.
* **Radix UI / shadcn/ui:** Componentes de interface com foco em acessibilidade (WAI-ARIA).
* **Lucide Icons:** Biblioteca gráfica vetorial para representação de categorias e elementos de navegação.
* **Leaflet:** Manipulação e renderização de camadas de mapas interativos e marcadores espaciais.

### Backend e Serviços Geoespaciais
* **Next.js Route Handlers:** Camada de API interna do servidor para orquestração de pedidos assíncronos.
* **OpenStreetMap (OSM):** Base cartográfica colaborativa e aberta de elementos urbanos.
* **Overpass API:** Execução de consultas espaciais com a linguagem Overpass QL.
* **Nominatim API:** Serviço de geocodificação direta e reversa de endereços e coordenadas.

---

## 5. Estrutura do Repositório

```text
├── app/
│   ├── api/
│   │   ├── geocode/route.ts       # Integração com o serviço de geocodificação Nominatim
│   │   └── score/route.ts         # Execução das consultas Overpass QL e cálculo do score
│   ├── globals.css                # Configuração dos tokens de estilo, tema e Tailwind v4
│   ├── layout.tsx                 # Layout raiz da aplicação e metadados de página
│   └── page.tsx                   # Controlador da página principal (orquestração do mapa e painel)
├── components/
│   ├── address-search.tsx         # Componente de pesquisa e seleção preditiva de endereços
│   ├── category-card.tsx          # Card analítico da categoria com listagem expansível de locais
│   ├── location-map.tsx           # Instanciação dinâmica do Leaflet e gestão dos marcadores
│   ├── results-panel.tsx          # Painel lateral informativo dos resultados consolidados
│   ├── score-display.tsx          # Indicador circular SVG da pontuação calculada
│   └── theme-provider.tsx         # Provedor de contexto para alternância de tema
├── lib/
│   └── utils.ts                   # Funções utilitárias compartilhadas
├── public/                        # Arquivos estáticos e ícones
├── package.json                   # Dependências e scripts de execução do ecossistema Node.js
└── tsconfig.json                  # Parâmetros de compilação do TypeScript
