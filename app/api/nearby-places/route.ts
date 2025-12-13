// app/api/nearby-places/route.ts
import { NextResponse } from "next/server";

const GEO_BASE = "https://api.geoapify.com/v2/places";

type NearbyRequestBody = {
  lat: number;
  lon: number;
  maxDistanceKm?: number;      // from your distance filter (100, 200, 500 ...)
  vibes?: string[];            // ["mountains","beach","history",...]
};

// map your "vibes" → Geoapify categories
// full list is in docs, but this is enough for now :contentReference[oaicite:4]{index=4}
// map your "vibes" → Geoapify categories (only using safe ones)
function mapVibesToCategories(vibes?: string[]): string {
    // Good generic tourist / fun categories that Geoapify supports
    const defaultCats = [
      "tourism.sights",
      "tourism.attraction",
      "entertainment",
      "leisure.park",
      "beach",
      "catering.restaurant",
    ];
  
    if (!vibes || vibes.length === 0) {
      return defaultCats.join(",");
    }
  
    const lower = vibes.map((v) => v.toLowerCase());
    const cats = new Set<string>();
  
    // mountains / treks → viewpoints, parks, nature-ish stuff
    if (lower.some((v) => v.includes("mountain") || v.includes("trek"))) {
      cats.add("tourism.sights");
      cats.add("leisure.park");
    }
  
    // beach / sea
    if (lower.some((v) => v.includes("beach") || v.includes("sea"))) {
      cats.add("beach");
      cats.add("tourism.attraction");
    }
  
    // history / forts / heritage
    if (lower.some((v) => v.includes("history") || v.includes("fort"))) {
      cats.add("tourism.attraction");
      cats.add("tourism.sights");
    }
  
    // temples / spiritual
    if (lower.some((v) => v.includes("temple") || v.includes("spiritual"))) {
      cats.add("religion");
      cats.add("tourism.sights");
    }
  
    // city / nightlife / party
    if (lower.some((v) => v.includes("city") || v.includes("nightlife"))) {
      cats.add("entertainment");
      cats.add("catering.restaurant");
    }
  
    // generic nature / lakes / waterfalls
    if (
      lower.some(
        (v) =>
          v.includes("nature") || v.includes("waterfall") || v.includes("lake")
      )
    ) {
      cats.add("leisure.park");
      cats.add("tourism.sights");
    }
  
    if (cats.size === 0) {
      defaultCats.forEach((c) => cats.add(c));
    }
  
    return Array.from(cats).join(",");
  }
  

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing GEOAPIFY_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as NearbyRequestBody;
    const { lat, lon, maxDistanceKm = 200, vibes } = body;

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "lat and lon are required" },
        { status: 400 }
      );
    }

    const radiusMeters = Math.min(maxDistanceKm, 200) * 1000; // cap 200km
    const categories = mapVibesToCategories(vibes);

    // Geoapify radius search, with proximity bias :contentReference[oaicite:5]{index=5}
    const params = new URLSearchParams({
      categories,
      filter: `circle:${lon},${lat},${radiusMeters}`,
      bias: `proximity:${lon},${lat}`,
      limit: "30",
      apiKey,
    });

    const url = `${GEO_BASE}?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      const txt = await res.text();
      console.error("Geoapify error:", res.status, txt);
    
      return NextResponse.json(
        {
          error: "Failed to fetch nearby places from Geoapify",
          status: res.status,
          geoapify: txt, // 👈 send back their message too
        },
        { status: 500 }
      );
    }
    

    const json = await res.json();

    const features = json.features ?? [];

    // Map Geoapify → your Place shape
    const places = features
    .map((f: any) => {
      const p = f.properties || {};
      const rawName = p.name || p.address_line1 || "";
  
      const name = rawName || "Unknown place";
  
      // 🚫 Filter out boring neighbourhood-ish names
      const lowerName = name.toLowerCase();
      const bannedBits = [
        "nagar",
        "layout",
        "phase",
        "road",
        "street",
        "st ",
        "cross",
        "colony",
        "extension",
        "block",
        "sector",
      ];
  
      const looksLikeLocality = bannedBits.some((w) => lowerName.includes(w));
      if (looksLikeLocality) return null;
  
      return {
        id: p.place_id ?? p.osm_id ?? `${p.lon},${p.lat}`,
        name,
        city: p.city || p.town || p.village || "",
        state: p.state || "",
        country: p.country || "",
        lat: p.lat,
        lon: p.lon,
        tags: (p.categories as string[]) || [],
        photos: [] as string[], // frontend adds fallback
        description: p.formatted || "",
        avgCostDay: 3000,
      };
    })
    .filter(Boolean); // remove nulls
  

    return NextResponse.json({ places });
  } catch (err) {
    console.error("Error in /api/nearby-places:", err);
    return NextResponse.json(
      { error: "Unexpected error while fetching nearby places" },
      { status: 500 }
    );
  }
}
