"use client"; // Executado exclusivamente no navegador, pois o Leaflet depende do objeto 'window' e manipulação direta do DOM

import { useEffect, useRef, useCallback } from "react";
// Importa apenas a definição de tipos do Leaflet para uso no TypeScript
import type { Map as LeafletMap } from "leaflet";

// Estrutura do ponto destacado (quando o usuário clica em um item da lista)
interface HighlightedPlace {
  name: string;      // Nome do local
  lat: number;       // Latitude
  lon: number;       // Longitude
  distance: number;  // Distância em metros
}

// Propriedades recebidas pelo componente de mapa
interface LocationMapProps {
  lat: number;                                          // Latitude do ponto central/pesquisado
  lon: number;                                          // Longitude do ponto central/pesquisado
  onLocationSelect: (lat: number, lon: number) => void; // Disparado quando o usuário clica diretamente no mapa
  amenities?: Array<{                                   // Lista de categorias e amenidades encontradas
    key: string;
    places: Array<{
      name: string;
      lat: number;
      lon: number;
      distance: number;
    }>;
  }>;
  highlightedPlace?: HighlightedPlace | null;           // Ponto a focar e destacar com efeito pulsante
}

// Cores associadas a cada categoria para os marcadores do mapa
const CATEGORY_COLORS: Record<string, string> = {
  supermarket: "#16a34a", // Verde
  pharmacy: "#2563eb",    // Azul
  hospital: "#dc2626",    // Vermelho
  school: "#9333ea",      // Roxo
  park: "#65a30d",        // Verde claro / Lima
  restaurant: "#ea580c",  // Laranja
  transport: "#0891b2",   // Ciano
};

// Rótulos em português para os balões de informação (popups)
const CATEGORY_LABELS: Record<string, string> = {
  supermarket: "Supermercado",
  pharmacy: "Farmacia",
  hospital: "Saude",
  school: "Educacao",
  park: "Lazer",
  restaurant: "Alimentacao",
  transport: "Transporte",
};

export default function LocationMap({
  lat,
  lon,
  onLocationSelect,
  amenities,
  highlightedPlace,
}: LocationMapProps) {
  // Instância do mapa do Leaflet mantida sem causar re-renderizações desnecessárias
  const mapRef = useRef<LeafletMap | null>(null);
  // Elemento HTML div onde o mapa será desenhado
  const containerRef = useRef<HTMLDivElement>(null);
  // Grupo de camadas que agrupa todos os pequenos pontos de amenidades
  const markersRef = useRef<ReturnType<typeof import("leaflet")["layerGroup"]> | null>(null);
  // Marcador temporário com animação pulsante para focar em um local selecionado
  const highlightMarkerRef = useRef<ReturnType<typeof import("leaflet")["marker"]> | null>(null);

  // Inicializa o mapa do Leaflet via importação dinâmica (evita erros de SSR no Next.js)
  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return;

    // Carrega o Leaflet e seus estilos CSS somente no cliente
    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    // Cria a instância do mapa centralizada na latitude/longitude fornecida com zoom 14
    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([lat, lon], 14);

    // Adiciona o controle de zoom (+ e -) no canto inferior direito
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Carrega a camada de imagens de mapa do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Ícone verde estilizado para marcar o ponto central de referência analisado
    const mainIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 32px; height: 32px; 
        background: #1a9a6c; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Posiciona o marcador principal no mapa
    L.marker([lat, lon], { icon: mainIcon }).addTo(map);

    // Cria o grupo de camadas para receber os pontos das amenidades
    markersRef.current = L.layerGroup().addTo(map);

    // Dispara a seleção de um novo ponto ao clicar livremente no mapa
    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
  }, [lat, lon, onLocationSelect]);

  // Monta o mapa na inicialização e o destrói adequadamente na desmontagem do componente
  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Atualiza o centro do mapa e move o marcador principal quando as coordenadas mudam
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.setView([lat, lon], map.getZoom());

    import("leaflet").then((L) => {
      // Remove apenas marcadores avulsos da camada base anterior
      map.eachLayer((layer) => {
        if ((layer as unknown as Record<string, unknown>)._icon) {
          map.removeLayer(layer);
        }
      });

      const mainIcon = L.default.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 32px; height: 32px; 
          background: #1a9a6c; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.default.marker([lat, lon], { icon: mainIcon }).addTo(map);
    });
  }, [lat, lon]);

  // Renderiza todos os pontos de amenidades (mercados, escolas, hospitais, etc.) com suas respectivas cores
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !amenities) return;

    // Limpa os marcadores anteriores para desenhar os novos da região
    markersRef.current.clearLayers();

    import("leaflet").then((L) => {
      if (!markersRef.current) return;

      for (const category of amenities) {
        const color = CATEGORY_COLORS[category.key] || "#666";
        const label = CATEGORY_LABELS[category.key] || category.key;

        for (const place of category.places) {
          // Cria uma bolinha colorida referente à categoria
          const icon = L.default.divIcon({
            className: "amenity-marker",
            html: `<div style="
              width: 12px; height: 12px; 
              background: ${color}; 
              border: 2px solid white; 
              border-radius: 50%; 
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const marker = L.default.marker([place.lat, place.lon], { icon });
          
          // Pop-up informativo ao clicar no ponto do mapa
          marker.bindPopup(
            `<div style="font-family: system-ui; font-size: 13px;">
              <strong>${place.name}</strong><br/>
              <span style="color: ${color}; font-weight: 500;">${label}</span><br/>
              <span style="color: #666;">${place.distance}m de distancia</span>
            </div>`
          );
          markersRef.current.addLayer(marker);
        }
      }
    });
  }, [amenities]);

  // Gerencia o foco e a animação quando um local específico é clicado na barra lateral
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      // Remove o marcador destacado anterior se existir
      if (highlightMarkerRef.current) {
        highlightMarkerRef.current.remove();
        highlightMarkerRef.current = null;
      }

      if (highlightedPlace && mapRef.current) {
        const map = mapRef.current;
        
        // Move o centro da visualização com animação suave e aumenta o zoom para 17
        map.setView([highlightedPlace.lat, highlightedPlace.lon], 17, {
          animate: true,
          duration: 0.5,
        });

        // Marcador vermelho pulsante para chamar a atenção do usuário
        const highlightIcon = L.default.divIcon({
          className: "highlight-marker",
          html: `<div style="
            width: 28px; height: 28px; 
            background: #dc2626; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 1.5s ease-in-out infinite;
          "></div>
          <style>
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(0,0,0,0.3); }
              50% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0.1), 0 2px 8px rgba(0,0,0,0.3); }
            }
          </style>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.default.marker([highlightedPlace.lat, highlightedPlace.lon], { 
          icon: highlightIcon,
          zIndexOffset: 1000, // Garante que o marcador fique acima de todos os outros
        });
        
        // Abre automaticamente o balão informativo do local destacado
        marker.bindPopup(
          `<div style="font-family: system-ui; font-size: 13px;">
            <strong>${highlightedPlace.name}</strong><br/>
            <span style="color: #666;">${highlightedPlace.distance}m de distancia</span>
          </div>`,
          { offset: [0, -10] }
        ).openPopup();
        
        marker.addTo(map);
        highlightMarkerRef.current = marker;
      }
    });
  }, [highlightedPlace]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}