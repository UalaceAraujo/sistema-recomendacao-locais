import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&accept-language=pt-BR`,
      {
        headers: {
          "User-Agent": "MyVicinity/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();

    const results = data.map(
      (item: {
        lat: string;
        lon: string;
        display_name: string;
        type: string;
        address?: Record<string, string>;
      }) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: item.display_name,
        type: item.type,
        address: item.address,
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar endereco" },
      { status: 500 }
    );
  }
}
