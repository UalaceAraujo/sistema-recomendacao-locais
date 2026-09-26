"use client"; // Executado no lado do cliente (Client Component) para permitir interatividade (abrir/fechar card)

import { useState } from "react";
// Ícones da biblioteca lucide-react para representar cada categoria de serviço urbano
import {
  ShoppingCart,    // Mercados / Supermercados
  Pill,            // Farmácias
  Heart,           // Hospitais / Saúde
  GraduationCap,   // Escolas / Educação
  Trees,           // Parques / Lazer
  UtensilsCrossed, // Restaurantes / Alimentação
  Bus,             // Transporte público
  MapPin,          // Ícone padrão caso a categoria não tenha ícone mapeado
  ChevronDown,     // Seta para expandir lista
  ChevronUp,       // Seta para recolher lista
} from "lucide-react";

// Componentes visuais do shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// Utilitário para concatenação condicional de classes do Tailwind
import { cn } from "@/lib/utils";
// Função auxiliar que define a cor do texto conforme a pontuação obtida
import { getScoreColor } from "@/components/score-display";

// Dicionário que mapeia o nome da categoria vindo da API para o respectivo componente de ícone
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Pill,
  Heart,
  GraduationCap,
  Trees,
  UtensilsCrossed,
  Bus,
};

// Estrutura de dados de cada estabelecimento/ponto encontrado no mapa
interface Place {
  name: string;      // Nome do local (ex: "Supermercado Extra", "Farmácia São Paulo")
  distance: number;  // Distância calculada em metros a partir do ponto central selecionado
  lat: number;       // Coordenada de latitude
  lon: number;       // Coordenada de longitude
}

// Propriedades recebidas pelo card da categoria
interface CategoryCardProps {
  label: string;                        // Nome visível da categoria (ex: "Mercados", "Saúde")
  icon: string;                         // Chave do ícone (deve corresponder a uma chave em ICONS)
  count: number;                        // Quantidade total de locais encontrados no raio de busca
  nearestDistance: number | null;       // Distância em metros do estabelecimento mais próximo
  score: number;                        // Nota calculada de 0 a 100 para esta categoria
  weight?: number;                      // Peso da categoria no cálculo da média geral (opcional)
  places: Place[];                      // Lista de todos os locais encontrados para expansão
  onPlaceClick?: (place: Place) => void;// Callback disparado ao clicar em um item da lista (foca o mapa nele)
}

// Define a cor de preenchimento da barra de progresso com base na nota alcançada
function getProgressColor(score: number): string {
  if (score >= 80) return "[&>[data-slot=progress-indicator]]:bg-primary";       // Excelente (Verde)
  if (score >= 60) return "[&>[data-slot=progress-indicator]]:bg-chart-3";       // Bom (Amarelo/Âmbar)
  if (score >= 40) return "[&>[data-slot=progress-indicator]]:bg-accent";        // Regular (Laranja)
  return "[&>[data-slot=progress-indicator]]:bg-destructive";                    // Baixo (Vermelho)
}

export default function CategoryCard({
  label,
  icon,
  count,
  nearestDistance,
  score,
  places,
  onPlaceClick,
}: CategoryCardProps) {
  // Estado que controla se a lista detalhada de estabelecimentos está aberta ou fechada
  const [expanded, setExpanded] = useState(false);

  // Seleciona o ícone correspondente ou usa o MapPin como fallback caso não encontre
  const IconComp = ICONS[icon] || MapPin;

  return (
    <Card className="py-4 gap-3 transition-shadow hover:shadow-md">
      <CardContent className="px-4">
        {/* Cabeçalho do Card: clicável para abrir ou recolher a listagem */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full cursor-pointer text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3">
            {/* Ícone com fundo colorido baseado no nível da nota */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                score >= 60
                  ? "bg-primary/10 text-primary"
                  : score >= 40
                    ? "bg-accent/10 text-accent-foreground"
                    : "bg-destructive/10 text-destructive"
              )}
            >
              <IconComp className="w-5 h-5" />
            </div>

            {/* Informações textuais da categoria */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground">
                  {label}
                </span>

                {/* Exibição da nota numérica e seta indicadora de expansão */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      getScoreColor(score)
                    )}
                  >
                    {score}
                  </span>
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Barra de progresso visual da nota de 0 a 100 */}
              <div className="flex items-center gap-3 mt-1.5">
                <Progress
                  value={score}
                  className={cn("h-1.5 flex-1", getProgressColor(score))}
                />
              </div>

              {/* Linha de resumo: quantidade de locais e distância do mais próximo */}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span>
                  {count} {count === 1 ? "local" : "locais"}
                </span>
                {nearestDistance !== null && (
                  <>
                    <span className="text-border">|</span>
                    <span>Mais proximo: {nearestDistance}m</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Lista expansível contendo os estabelecimentos encontrados */}
        {expanded && places.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <ul className="flex flex-col gap-1">
              {places.map((place, i) => (
                <li key={`${place.lat}-${place.lon}-${i}`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      // Impede que o clique no item feche acidentalmente o card pai
                      e.stopPropagation();
                      // Notifica o componente pai para centralizar o mapa ou abrir o popup do local
                      onPlaceClick?.(place);
                    }}
                    className="w-full flex items-center justify-between text-sm p-2 -mx-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    {/* Nome do estabelecimento com corte de texto em reticências se for muito longo */}
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      <span className="truncate text-foreground group-hover:text-primary transition-colors text-left">
                        {place.name}
                      </span>
                    </div>

                    {/* Distância em metros com números de largura fixa (tabular-nums) */}
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                      {place.distance}m
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mensagem exibida caso o card seja expandido mas nenhum local tenha sido encontrado */}
        {expanded && places.length === 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum local encontrado nesta categoria
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}