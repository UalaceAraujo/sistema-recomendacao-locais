"use client"; // Executado no cliente (Client Component) para permitir transições CSS dinâmicas

// Utilitário para mesclar classes CSS e Tailwind de forma limpa
import { cn } from "@/lib/utils";

// Propriedades aceitas pelo componente
interface ScoreDisplayProps {
  score: number;                   // Nota numérica final de 0 a 100
  size?: "sm" | "md" | "lg";       // Tamanho visual do anel (pequeno, médio ou grande)
  showLabel?: boolean;             // Define se exibe a pílula de texto ("Excelente", "Bom", etc.)
}

/**
 * Retorna a classe de cor de texto do Tailwind correspondente à faixa de nota.
 * Também é exportada para ser reutilizada em outros componentes (ex: CategoryCard).
 */
function getScoreColor(score: number): string {
  if (score >= 80) return "text-primary";     // Verde (Excelente)
  if (score >= 60) return "text-chart-3";     // Amarelo/Âmbar (Bom)
  if (score >= 40) return "text-accent";      // Laranja (Regular)
  return "text-destructive";                  // Vermelho (Abaixo da média / Insuficiente)
}

/**
 * Retorna a classificação textual em português conforme a faixa de nota.
 */
function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  if (score >= 20) return "Abaixo da media";
  return "Insuficiente";
}

/**
 * Retorna a cor de fundo com opacidade para a badge/pílula descritiva.
 */
function getScoreBg(score: number): string {
  if (score >= 80) return "bg-primary/10";
  if (score >= 60) return "bg-chart-3/10";
  if (score >= 40) return "bg-accent/10";
  return "bg-destructive/10";
}

export default function ScoreDisplay({
  score,
  size = "md",
  showLabel = true,
}: ScoreDisplayProps) {
  // Dimensões do elemento container para cada variação de tamanho
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  // Tamanho tipográfico do número central
  const fontClasses = {
    sm: "text-xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  // Raio do círculo SVG para cada tamanho
  const radius = size === "sm" ? 26 : size === "md" ? 48 : 62;
  
  // Cálculo matemático do perímetro do círculo: C = 2 * PI * r
  const circumference = 2 * Math.PI * radius;
  
  // Deslocamento do traço SVG proporcional à nota de 0 a 100
  // (quanto maior a nota, menor o deslocamento e mais preenchido fica o anel)
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Espessura da linha do anel
  const strokeWidth = size === "sm" ? 4 : 5;
  
  // Configurações do sistema de coordenadas do SVG
  const viewBox =
    size === "sm" ? "0 0 60 60" : size === "md" ? "0 0 112 112" : "0 0 144 144";
  const center = size === "sm" ? 30 : size === "md" ? 56 : 72;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Container relativo do anel circular */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* O SVG tem rotação de -90 graus para que o progresso inicie no topo (12 horas) */}
        <svg viewBox={viewBox} className="w-full h-full -rotate-90">
          {/* Círculo base (trilha de fundo em tom suave) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted"
            strokeWidth={strokeWidth}
          />
          {/* Círculo animado de progresso da pontuação */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={cn(getScoreColor(score), "transition-all duration-1000 ease-out")}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Texto numérico centralizado sobre o anel */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold tabular-nums", fontClasses[size], getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>

      {/* Pílula descritiva da nota ("Excelente", "Bom", etc.) */}
      {showLabel && (
        <span
          className={cn(
            "text-sm font-medium px-3 py-1 rounded-full",
            getScoreBg(score),
            getScoreColor(score)
          )}
        >
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

// Exporta as funções auxiliares para reutilização consistente em outros módulos
export { getScoreColor, getScoreLabel, getScoreBg };