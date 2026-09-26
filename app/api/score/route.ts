import { NextRequest, NextResponse } from "next/server";

interface AmenityCategory {
  key: string;
  label: string;
  icon: string;
  tags: string[];
  weight: number;
  idealCount: number;
  maxDistance: number;
}

const CATEGORIES: AmenityCategory[] = [
  {
    key: "supermarket",
    label: "Supermercados",
    icon: "ShoppingCart",
    tags: ["shop=supermarket", "shop=convenience"],
    weight: 20,
    idealCount: 3,
    maxDistance: 1500,
  },
  {
    key: "pharmacy",
    label: "Farmacias",
    icon: "Pill",
    tags: ["amenity=pharmacy"],
    weight: 15,
    idealCount: 2,
    maxDistance: 1500,
  },
  {
    key: "hospital",
    label: "Saude",
    icon: "Heart",
    tags: ["amenity=hospital", "amenity=clinic", "amenity=doctors"],
    weight: 20,
    idealCount: 2,
    maxDistance: 3000,
  },
  {
    key: "school",
    label: "Educacao",
    icon: "GraduationCap",
    tags: ["amenity=school", "amenity=university", "amenity=college"],
    weight: 15,
    idealCount: 3,
    maxDistance: 2000,
  },
  {
    key: "park",
    label: "Lazer",
    icon: "Trees",
    tags: ["leisure=park", "leisure=garden", "leisure=playground"],
    weight: 10,
    idealCount: 2,
    maxDistance: 2000,
  },
  {
    key: "restaurant",
    label: "Alimentacao",
    icon: "UtensilsCrossed",
    tags: ["amenity=restaurant", "amenity=cafe", "amenity=fast_food", "amenity=bakery"],
    weight: 10,
    idealCount: 5,
    maxDistance: 1500,
  },
  {
    key: "transport",
    label: "Transporte",
    icon: "Bus",
    tags: ["highway=bus_stop", "amenity=bus_station", "railway=station", "railway=halt"],
    weight: 10,
    idealCount: 3,
    maxDistance: 1500,
  },
];

function buildOverpassQuery(lat: number, lon: number, radius: number): string {
  const tagQueries: string[] = [];

  for (const category of CATEGORIES) {
    for (const tag of category.tags) {
      const [key, value] = tag.split("=");
      tagQueries.push(`node["${key}"="${value}"](around:${radius},${lat},${lon});`);
      tagQueries.push(`way["${key}"="${value}"](around:${radius},${lat},${lon});`);
    }
  }

  return `
    [out:json][timeout:30];
    (
      ${tagQueries.join("\n      ")}
    );
    out center;
  `;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface CategoryResult {
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
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function classifyElement(tags: Record<string, string>): string | null {
  for (const category of CATEGORIES) {
    for (const tag of category.tags) {
      const [key, value] = tag.split("=");
      if (tags[key] === value) {
        return category.key;
      }
    }
  }
  return null;
}

function calculateCategoryScore(
  count: number,
  nearestDistance: number | null,
  category: AmenityCategory
): number {
  if (count === 0) return 0;

  const countScore = Math.min(count / category.idealCount, 1) * 50;

  let distanceScore = 0;
  if (nearestDistance !== null) {
    distanceScore = Math.max(0, 1 - nearestDistance / category.maxDistance) * 50;
  }

  return Math.round(countScore + distanceScore);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const radius = parseInt(searchParams.get("radius") || "1500", 10);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Latitude e longitude sao obrigatorios" },
      { status: 400 }
    );
  }

  const maxRadius = Math.max(
    radius,
    ...CATEGORIES.map((c) => c.maxDistance)
  );

  const query = buildOverpassQuery(lat, lon, maxRadius);

  const OVERPASS_ENDPOINTS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  try {
    let data = null;
    let lastError = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "MyVicinity/1.0",
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (response.ok) {
          data = await response.json();
          break;
        } else {
          lastError = new Error(`${endpoint} returned ${response.status}`);
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!data) {
      throw lastError || new Error("All Overpass endpoints failed");
    }
    const elements: OverpassElement[] = data.elements || [];

    const categoryMap: Record<
      string,
      Array<{ name: string; distance: number; lat: number; lon: number }>
    > = {};
    for (const cat of CATEGORIES) {
      categoryMap[cat.key] = [];
    }

    for (const el of elements) {
      const tags = el.tags || {};
      const categoryKey = classifyElement(tags);
      if (!categoryKey) continue;

      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat === undefined || elLon === undefined) continue;

      const distance = haversineDistance(lat, lon, elLat, elLon);
      const name =
        tags.name || tags["name:pt"] || tags.brand || "Sem nome";

      categoryMap[categoryKey].push({
        name,
        distance: Math.round(distance),
        lat: elLat,
        lon: elLon,
      });
    }

    const results: CategoryResult[] = CATEGORIES.map((category) => {
      const places = categoryMap[category.key]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
      const count = places.length;
      const nearestDistance = count > 0 ? places[0].distance : null;
      const score = calculateCategoryScore(count, nearestDistance, category);

      return {
        key: category.key,
        label: category.label,
        icon: category.icon,
        count,
        nearestDistance,
        score,
        weight: category.weight,
        places,
      };
    });

    const totalScore = Math.round(
      results.reduce((acc, r) => acc + (r.score * r.weight) / 100, 0)
    );

    return NextResponse.json({
      lat,
      lon,
      radius: maxRadius,
      totalScore,
      categories: results,
    });
  } catch (error) {
    console.error("Overpass API error:", error);
    return NextResponse.json(
      { error: "Erro ao consultar dados do OpenStreetMap. Tente novamente." },
      { status: 500 }
    );
  }
}
