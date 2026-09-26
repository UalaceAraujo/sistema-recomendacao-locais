"use client"; // Executa no cliente (Client Component) para permitir interatividade nos cards e na rolagem

// Ícone de pin de mapa da biblioteca lucide-react
import { MapPin } from "lucide-react";
// Componentes visuais do shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Componente visual da nota geral em círculo/destaque
import ScoreDisplay from "@/components/score-display";
// Card individual com nota, progresso e lista recolhível de cada categoria
import CategoryCard from "@/components/category-card";

// Estrutura de dados com os resultados de cada categoria (mercados, saúde, transporte, etc.)
interface CategoryResult {
  key: string;                    // Identificador único (ex: "supermarket", "pharmacy")
  label: string;                  // Nome amigável de exibição (ex: "Mercados", "Farmácias")
  icon: string;                   // Nome do ícone associado
  count: number;                  // Quantidade de estabelecimentos encontrados
  nearestDistance: number | null; // Distância em metros do local mais perto
  score: number;                  // Nota obtida de 0 a 100
  weight: number;                 // Peso no cálculo da nota geral
  places: Array<{                 // Locais específicos que compõem essa categoria
    name: string;
    distance: number;
    lat: number;
    lon: number;
  }>;
}

// Estrutura completa retornada pela API com a avaliação da coordenada
interface ScoreData {
  lat: number;                    // Latitude avaliada
  lon: number;                    // Longitude avaliada
  radius: number;                 // Raio de busca analisado (em metros)
  totalScore: number;             // Nota global ponderada de qualidade de vida (0 a 100)
  categories: CategoryResult[];   // Lista de todas as categorias analisadas
}

// Representação de um local clicado
interface Place {
  name: string;
  distance: number;
  lat: number;
  lon: number;
}

// Propriedades recebidas pelo painel de resultados
interface ResultsPanelProps {
  data: ScoreData;                           // Dados do cálculo da nota e categorias
  locationName?: string;                     // Nome textual do endereço (ex: "Av. Paulista, São Paulo")
  onPlaceClick?: (place: Place) => void;     // Callback chamado ao clicar em um estabelecimento
}

export default function ResultsPanel({ data, locationName, onPlaceClick }: ResultsPanelProps) {
  // Soma a quantidade de locais encontrados em todas as categorias
  const totalPlaces = data.categories.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Bloco superior com a nota geral e resumo da busca */}
      <Card className="border-0 shadow-none bg-transparent gap-4">
        <CardHeader className="px-0 pb-0">
          {/* Endereço ou coordenadas geográficas da busca */}
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">
              {locationName ||
                `${data.lat.toFixed(5)}, ${data.lon.toFixed(5)}`}
            </span>
          </div>
          <CardTitle className="text-lg text-foreground">
            Pontuacao do Local
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex items-center gap-6">
            {/* Visualizador circular com a nota global ponderada */}
            <ScoreDisplay score={data.totalScore} size="md" />

            {/* Badges de resumo e texto explicativo */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {totalPlaces} locais encontrados
                </Badge>
                {/* Converte o raio de metros para quilômetros com 1 casa decimal */}
                <Badge variant="secondary" className="text-xs">
                  Raio de {(data.radius / 1000).toFixed(1)}km
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pontuacao baseada na proximidade e quantidade de servicos essenciais ao redor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Título da seção detalhada */}
      <div className="mt-2 mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Detalhes por categoria
        </h3>
      </div>

      {/* Área rolável para exibir todos os cards sem quebrar o layout da página */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="flex flex-col gap-3 pb-4">
          {/* Ordena as categorias da maior nota para a menor antes de renderizar */}
          {data.categories
            .sort((a, b) => b.score - a.score)
            .map((category) => (
              <CategoryCard
                key={category.key}
                label={category.label}
                icon={category.icon}
                count={category.count}
                nearestDistance={category.nearestDistance}
                score={category.score}
                weight={category.weight}
                places={category.places}
                onPlaceClick={onPlaceClick}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}