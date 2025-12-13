// app/api/places-live/route.ts
import { NextResponse } from "next/server";

const GEO_KEY = process.env.GEOAPIFY_API_KEY ?? "";
const FSQ_KEY = process.env.FSQ_API_KEY ?? "";

// helper: unsplash fallback
const unsplashFor = (q: string) => `https://source.unsplash.com/1000x700/?${encodeURIComponent(q)}`;

// Geoapify: Places search (v2)
async function geoapifySearch(lat: number, lon: number, radius: number, categories?: string, limit = 40) {
  if (!GEO_KEY) return [];
  const params = new URLSearchParams({
    apiKey: GEO_KEY,
    limit: String(limit),
    filter: `circle:${lon},${lat},${radius}`,
  });
  if (categories) params.set("categories", categories);
  const url = `https://api.geoapify.com/v2/places?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "<no text>");
    console.warn("[places-live] Geoapify failed:", res.status, txt);
    return [];
  }
  const json = await res.json();
  return json?.features ?? [];
}

// Geoapify: try to extract photos from feature properties (Geoapify sometimes includes `properties.image` or `properties.photos`)
function extractGeoPhotos(feature: any): string[] {
  const props = feature?.properties ?? {};
  const photos: string[] = [];
  if (props.image) photos.push(props.image);
  if (props.photos && Array.isArray(props.photos)) {
    props.photos.forEach((p: any) => {
      if (p?.url) photos.push(p.url);
    });
  }
  // Geoapify sometimes includes `thumbnails` or `image` nested; check a couple patterns
  if (props.thumbnail) photos.push(props.thumbnail);
  return photos.filter(Boolean);
}

// Foursquare search (v3)
async function fsqSearch(lat: number, lon: number, radius: number, query?: string, limit = 40) {
  if (!FSQ_KEY) return [];
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  params.set("ll", `${lat},${lon}`);
  params.set("radius", String(radius));
  params.set("limit", String(limit));
  const url = `https://api.foursquare.com/v3/places/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: FSQ_KEY, Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "<no text>");
    console.warn("[places-live] Foursquare search failed:", res.status, txt);
    return [];
  }
  const json = await res.json();
  return json?.results ?? [];
}

async function fsqPhotos(placeId: string, limit = 3): Promise<string[]> {
  if (!FSQ_KEY) return [];
  try {
    const res = await fetch(`https://api.foursquare.com/v3/places/${placeId}/photos?limit=${limit}`, {
      headers: { Authorization: FSQ_KEY, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const arr = await res.json();
    if (!Array.isArray(arr)) return [];
    return arr
      .map((p: any) => {
        if (!p) return null;
        const width = p.width || 800;
        return p.prefix && p.suffix ? `${p.prefix}${width}${p.suffix}` : null;
      })
      .filter(Boolean) as string[];
  } catch (e) {
    console.warn("[places-live] fsqPhotos error", e);
    return [];
  }
}

// Wikimedia geosearch (public)
async function wikigeosearch(lat: number, lon: number, radius = 50000, limit = 50) {
  const params = new URLSearchParams({
    action: "query",
    list: "geosearch",
    gscoord: `${lat}|${lon}`,
    gsradius: String(radius),
    gslimit: String(limit),
    format: "json",
    origin: "*",
  });
  const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("[places-live] Wikimedia geosearch failed", res.status);
    return [];
  }
  const json = await res.json();
  return json?.query?.geosearch ?? [];
}

async function wikimediaPageImages(pageIds: number[]) {
  if (!pageIds || pageIds.length === 0) return {};
  const params = new URLSearchParams({
    action: "query",
    prop: "pageimages|info",
    pageids: pageIds.join("|"),
    piprop: "thumbnail",
    pithumbsize: "1000",
    inprop: "url",
    format: "json",
    origin: "*",
  });
  const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return {};
  const json = await res.json();
  return json?.query?.pages ?? {};
}

function uniqBy<T>(arr: T[], k: (t: T) => string) {
  const map = new Map<string, T>();
  for (const a of arr) map.set(k(a), a);
  return Array.from(map.values());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({} as any))) || {};
    const lat = Number(body.lat) || 20.5937; // center India fallback
    const lon = Number(body.lon) || 78.9629;
    let radius = Number(body.radiusMeters || body.radius) || 100000; // meters
    radius = Math.min(radius, 300000);

    const vibes: string[] = Array.isArray(body.vibes) && body.vibes.length
      ? body.vibes
      : ["beach", "viewpoint", "waterfall", "temple", "museum", "park", "nightlife", "restaurant"];

    // 1) Try Geoapify first (freemium)
    let places: any[] = [];
    if (GEO_KEY) {
      try {
        // call multiple category groups for broader coverage
        const cats = ["tourism.sights", "tourism.museums", "leisure.park", "food.restaurant", "accommodation.hotel", "entertainment.nightlife"];
        const fetches = cats.map(c => geoapifySearch(lat, lon, radius, c, 40).catch(() => []));
        const settled = await Promise.all(fetches);
        const flat: any[] = ([] as any[]).concat(...settled);
        if (flat.length > 0) {
          // dedupe & map
          const uniq = uniqBy(flat, (f: any) => String(f?.properties?.place_id ?? JSON.stringify(f)));
          // convert to normalized objects
          places = uniq.map((f: any) => {
            const props = f.properties ?? {};
            const id = `geo:${props.place_id ?? props.osm_id ?? Math.random()}`;
            const name = props.name ?? props.title ?? props.address?.name ?? "Place";
            const latp = (f.geometry?.coordinates ? f.geometry.coordinates[1] : props.lat) ?? null;
            const lonp = (f.geometry?.coordinates ? f.geometry.coordinates[0] : props.lon) ?? null;
            const photos = extractGeoPhotos(f);
            return { id, name, lat: latp, lon: lonp, categories: props.categories ? [props.categories] : [], photos, distanceMeters: props.dist ?? null, source: "geoapify", raw: f };
          });
          console.log(`[places-live] Geoapify returned ${places.length}`);
        } else {
          console.log("[places-live] Geoapify returned 0 results");
        }
      } catch (e) {
        console.warn("[places-live] Geoapify exception", e);
      }
    } else {
      console.log("[places-live] GEOAPIFY_API_KEY not set — skipping Geoapify");
    }

    // 2) If insufficient results, try Foursquare (if key)
    if ((!places || places.length < 12) && FSQ_KEY) {
      try {
        // query a few common keywords to increase recall
        const keywords = [...vibes].slice(0, 6);
        const searchPromises = keywords.map(k => fsqSearch(lat, lon, radius, k, 50).catch(() => []));
        const settled = await Promise.all(searchPromises);
        const flat = ([] as any[]).concat(...settled);
        if (flat.length > 0) {
          const uniq = uniqBy(flat, (p: any) => p.fsq_id || p.id || JSON.stringify(p));
          // map to normalized objects
          const mapped = [];
          for (let i = 0; i < uniq.length; i++) {
            const p = uniq[i];
            const id = `fsq:${p.fsq_id || p.id}`;
            const name = p.name || (p.location && p.location.name) || "Place";
            const latp = p.geocodes?.main?.latitude ?? p.lat ?? null;
            const lonp = p.geocodes?.main?.longitude ?? p.lon ?? null;
            let photos: string[] = [];
            if (i < 60 && (p.fsq_id || p.id)) {
              photos = await fsqPhotos(p.fsq_id || p.id, 3).catch(() => []);
            }
            mapped.push({ id, name, lat: latp, lon: lonp, categories: (p.categories || []).map((c: any) => c.name), photos, distanceMeters: p.distance ?? null, source: "foursquare", raw: p });
          }
          // merge with existing (but keep geoapify first)
          places = places.concat(mapped);
          places = uniqBy(places, (x: any) => x.id);
          console.log(`[places-live] Foursquare added ${mapped.length} items — total ${places.length}`);
        } else {
          console.log("[places-live] Foursquare returned 0");
        }
      } catch (e) {
        console.warn("[places-live] Foursquare exception", e);
      }
    }

    // 3) If still empty, try Wikimedia geosearch for famous nearby places (no key)
    if (!places || places.length === 0) {
      try {
        const wiki = await wikigeosearch(lat, lon, Math.min(radius, 50000), 80);
        if (Array.isArray(wiki) && wiki.length > 0) {
          const pageIds = wiki.slice(0, 40).map((p: any) => p.pageid).filter(Boolean);
          const pages = await wikimediaPageImages(pageIds);
          const mapped = wiki.slice(0, 60).map((w: any) => {
            const name = w.title || w.name || "Place";
            const id = `wiki:${w.pageid || name}-${w.lat}-${w.lon}`;
            const latp = w.lat ?? w.lat ?? null;
            const lonp = w.lon ?? w.lon ?? null;
            const page = pages?.[w.pageid];
            const photos = page?.thumbnail?.source ? [page.thumbnail.source] : [unsplashFor(name)];
            return { id, name, lat: latp, lon: lonp, categories: [], photos, distanceMeters: w.dist ?? null, source: "wikimedia", raw: w };
          });
          places = mapped;
          console.log(`[places-live] Wikimedia returned ${mapped.length}`);
        } else {
          console.log("[places-live] Wikimedia returned 0");
        }
      } catch (e) {
        console.warn("[places-live] Wikimedia exception", e);
      }
    }

    // final fallback: if still empty, return unsplash placeholders based on vibes (guarantee UI content)
    if (!places || places.length === 0) {
      const placeholders = [];
      for (let i = 0; i < 12; i++) {
        const q = vibes[i % vibes.length];
        placeholders.push({ id: `unsplash:${i}`, name: `${q} near you`, lat, lon, categories: [q], photos: [unsplashFor(q)], source: "unsplash" });
      }
      return NextResponse.json({ ok: true, places: placeholders });
    }

    // dedupe and limit and shuffle
    const final = uniqBy(places, (p: any) => p.id).slice(0, 200);
    for (let i = final.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [final[i], final[j]] = [final[j], final[i]];
    }

    return NextResponse.json({ ok: true, places: final });
  } catch (err: any) {
    console.error("[places-live] route error:", err);
    return NextResponse.json({ error: err?.message ?? "server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "/api/places-live ready — POST lat/lon/radius/vibes" });
}
