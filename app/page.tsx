"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Navigation, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressSearch from "@/components/address-search";
import ResultsPanel from "@/components/results-panel";

const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-xl">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  ),
});

interface ScoreData {
  lat: number;
  lon: number;
  radius: number;
  totalScore: number;
  categories: Array<{
    key: string;
    label: string;
    icon: string;
    count: number;
    nearestDistance: number | null;
    score: number;
    weight: number;
    places: Array<{
      name: string;
      distance: number;
      lat: number;
      lon: number;
    }>;
  }>;
}

const DEFAULT_LAT = -23.5505;
const DEFAULT_LON = -46.6333;

export default function HomePage() {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [highlightedPlace, setHighlightedPlace] = useState<{
    name: string;
    lat: number;
    lon: number;
    distance: number;
  } | null>(null);

  const fetchScore = useCallback(async (latitude: number, longitude: number) => {
    setIsLoading(true);
    setError("");
    setHasSearched(true);
    setHighlightedPlace(null);

    try {
      const res = await fetch(
        `/api/score?lat=${latitude}&lon=${longitude}&radius=1500`
      );
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setScoreData(data);
    } catch {
      setError("Erro ao buscar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLocationSelect = useCallback(
    (latitude: number, longitude: number) => {
      setLat(latitude);
      setLon(longitude);
      setLocationName("");
      fetchScore(latitude, longitude);
    },
    [fetchScore]
  );

  const handleAddressSelect = useCallback(
    (latitude: number, longitude: number, name: string) => {
      setLat(latitude);
      setLon(longitude);
      setLocationName(name);
      fetchScore(latitude, longitude);
    },
    [fetchScore]
  );

  const handlePlaceClick = useCallback((place: {
    name: string;
    lat: number;
    lon: number;
    distance: number;
  }) => {
    setHighlightedPlace(place);
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalizacao nao suportada pelo navegador.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLon(longitude);
        setLocationName("Minha localizacao");
        fetchScore(latitude, longitude);
      },
      () => {
        setError("Nao foi possivel obter sua localizacao.");
        setIsLoading(false);
      }
    );
  }, [fetchScore]);

  return (
    <main className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight text-balance">
                MyVicinity
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Encontre o melhor lugar para morar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={isLoading}
              className="gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Minha localizacao</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card flex flex-col overflow-hidden">
          {/* Search */}
          <div className="shrink-0 p-4 pb-3">
            <AddressSearch
              onSelect={handleAddressSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Analisando a regiao...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando dados do OpenStreetMap
                  </p>
                </div>
              </div>
            )}

            {error && !isLoading && (
              <Card className="border-destructive/20 bg-destructive/5 gap-0">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {scoreData && !isLoading && (
              <ResultsPanel 
                data={scoreData} 
                locationName={locationName} 
                onPlaceClick={handlePlaceClick}
              />
            )}

            {!hasSearched && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground text-balance">
                    Descubra a pontuacao do seu bairro
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[280px] text-pretty">
                    Busque um endereco ou clique no mapa para analisar a qualidade da regiao.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[260px]">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-foreground">1</span>
                    </div>
                    Busque ou clique no mapa
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-foreground">2</span>
                    </div>
                    Analisamos os servicos proximos
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-foreground">3</span>
                    </div>
                    Receba uma pontuacao detalhada
                  </div>
                </div>

                <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-start gap-2 max-w-[300px]">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                    Dados fornecidos pelo OpenStreetMap. A pontuacao considera supermercados, farmacias, hospitais, escolas, lazer, alimentacao e transporte.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-0">
          <LocationMap
            lat={lat}
            lon={lon}
            onLocationSelect={handleLocationSelect}
            amenities={scoreData?.categories}
            highlightedPlace={highlightedPlace}
          />

          {/* Map overlay hint */}
          {!hasSearched && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
              <div className="bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground font-medium">
                  Clique no mapa para analisar uma localizacao
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
