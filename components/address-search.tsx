"use client"; // Informa ao Next.js que este componente roda no navegador (Client Component)

import { useState, useRef, useEffect, useCallback } from "react";
// Ícones utilitários da biblioteca lucide-react
import { Search, MapPin, Loader2, X } from "lucide-react";
// Utilitário para mesclar classes CSS condicionais sem conflitos
import { cn } from "@/lib/utils";

// Modelo de dados de cada endereço retornado pela API
interface SearchResult {
  lat: number;          // Latitude geográfica
  lon: number;          // Longitude geográfica
  displayName: string;  // Nome formatado do endereço completo
  type: string;         // Categoria do local (ex: rua, cidade, bairro)
}

// Propriedades recebidas pelo componente
interface AddressSearchProps {
  // Função de callback disparada quando o usuário clica em um endereço
  onSelect: (lat: number, lon: number, name: string) => void;
  // Indicador opcional de carregamento vindo de fora (ex: enquanto busca amenidades)
  isLoading?: boolean;
}

export default function AddressSearch({ onSelect, isLoading }: AddressSearchProps) {
  // Texto digitado pelo usuário no campo de entrada
  const [query, setQuery] = useState("");
  // Lista com as sugestões retornadas pela busca
  const [results, setResults] = useState<SearchResult[]>([]);
  // Indica se a chamada HTTP interna para /api/geocode está em andamento
  const [isSearching, setIsSearching] = useState(false);
  // Controla a visibilidade da lista flutuante de sugestões
  const [showResults, setShowResults] = useState(false);

  // Referência para o container geral (usado para detectar cliques fora dele)
  const containerRef = useRef<HTMLDivElement>(null);
  // Referência para armazenar o timer do debounce e evitar requisições a cada tecla
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Função que faz a busca do endereço na rota de geocodificação da API interna
  const searchAddress = useCallback(async (q: string) => {
    // Evita chamadas desnecessárias se o texto for curto demais (mínimo 3 caracteres)
    if (!q.trim() || q.trim().length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch {
      // Em caso de falha de conexão ou erro na API, limpa a lista de resultados
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Efeito de "Debounce": espera o usuário parar de digitar por 400ms antes de disparar a busca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      searchAddress(query);
    }, 400);

    // Limpa o timer pendente se o componente desmontar ou se o texto mudar novamente
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchAddress]);

  // Efeito para fechar o menu suspenso caso o usuário clique em qualquer lugar fora do componente
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Campo de pesquisa com ícone e botões de ação */}
      <div className="relative">
        {/* Ícone de lupa fixado à esquerda */}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Buscar endereco, cidade ou bairro..."
          className={cn(
            "w-full h-12 pl-11 pr-10 rounded-xl border border-input bg-card text-foreground",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-all"
          )}
          aria-label="Buscar endereco"
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={showResults}
        />

        {/* Ícone giratório de carregamento quando está buscando internamente ou externamente */}
        {(isSearching || isLoading) && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground animate-spin" />
        )}

        {/* Botão de limpar texto (aparece apenas quando há texto e não está carregando) */}
        {query && !isSearching && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu suspenso flutuante com a lista de endereços encontrados */}
      {showResults && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 top-full mt-2 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
        >
          {results.map((result, i) => (
            <li key={`${result.lat}-${result.lon}-${i}`}>
              <button
                type="button"
                role="option"
                onClick={() => {
                  // Notifica o componente pai sobre a coordenada e o local escolhido
                  onSelect(result.lat, result.lon, result.displayName);
                  // Atualiza o texto do campo apenas com a primeira parte do nome (mais amigável)
                  setQuery(result.displayName.split(",")[0]);
                  // Fecha o menu suspenso
                  setShowResults(false);
                }}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground leading-relaxed line-clamp-2">
                  {result.displayName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}