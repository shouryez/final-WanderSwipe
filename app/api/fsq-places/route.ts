// app/api/fsq-places/route.ts
import { NextResponse } from "next/server"

const FSQ_KEY = process.env.FSQ_API_KEY || ""

if (!FSQ_KEY) {
  console.warn("[fsq-places] FSQ_API_KEY not set in env. Route will fail.")
}

async function fsqSearch(lat: number, lon: number, radius: number, query?: string, limit = 30) {
  const params = new URLSearchParams()
  if (query) params.set("query", query)
  params.set("ll", `${lat},${lon}`)
  params.set("radius", String(radius))
  params.set("limit", String(limit))

  const res = await fetch(`https://api.foursquare.com/v3/places/search?${params.toString()}`, {
    headers: {
      Authorization: FSQ_KEY,
      Accept: "application/json",
    },
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`FSQ search failed ${res.status}: ${txt}`)
  }
  return res.json()
}

async function fsqPhotos(placeId: string, limit = 3) {
  const res = await fetch(`https://api.foursquare.com/v3/places/${placeId}/photos?limit=${limit}`, {
    headers: {
      Authorization: FSQ_KEY,
      Accept: "application/json",
    },
  })
  if (!res.ok) {
    // some places won't have photos or endpoint can return 404
    return []
  }
  const json = await res.json()
  // Foursquare returns an array of photo meta: build photo url per docs (prefix + width + suffix)
  // Example item: { id, created_at, prefix, suffix, width, height }
  if (!Array.isArray(json)) return []
  return json
    .map((p: any) => {
      // prefer a medium width
      const width = p.width || 800
      // prefix + width + suffix
      if (p.prefix && p.suffix) return `${p.prefix}${width}${p.suffix}`
      return null
    })
    .filter(Boolean)
}

// simple fallback to Unsplash random image for a query (no key)
function unsplashFallback(query: string) {
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    // expected body: { lat, lon, radiusMeters, vibes: ["beach","temple"] }
    const lat = Number(body.lat) || 20.5937 // fallback center of India
    const lon = Number(body.lon) || 78.9629
    const radius = Number(body.radiusMeters) || 100000 // wide fallback 100 km
    const vibes =
      Array.isArray(body.vibes) && body.vibes.length
        ? body.vibes
        : ["beach", "viewpoint", "waterfall", "temple", "museum", "park", "nightlife", "restaurant"]

    // Query a few keywords in parallel to increase variety
    const promises = vibes.map((q: string) =>
      fsqSearch(lat, lon, radius, q, 40).catch((e) => {
        console.warn("fsqSearch error", e)
        return { results: [] }
      }),
    )
    const settled = await Promise.all(promises)

    // merge & dedupe by fsq id
    const byId = new Map<string, any>()
    for (const s of settled) {
      const arr = s?.results ?? s?.results ?? s?.places ?? []
      for (const p of arr) {
        // Foursquare v3 returns "fsq_id" or "fsq_id" under different keys - account for both
        const id = p.fsq_id || p.fsq_id || p.id || p?.fsq_id
        if (!id) continue
        if (!byId.has(id)) byId.set(id, p)
      }
    }

    // Convert map to array and enrich top N with photos (limit calls)
    const all = Array.from(byId.values())
    const MAX_ENRICH = 80
    const places = []
    for (let i = 0; i < all.length; i++) {
      const p: any = all[i]
      // Foursquare search response can vary: coordinates sometimes in p.geocodes.main
      const latp = p?.geocodes?.main?.latitude ?? p?.latitude ?? p?.lat ?? null
      const lonp = p?.geocodes?.main?.longitude ?? p?.longitude ?? p?.lng ?? p?.lon ?? null
      const name = p?.name || p?.location?.name || "Unknown place"
      const id = p?.fsq_id || p?.fsq_id || p?.id
      const categories = (p?.categories || []).map((c: any) => c.name).slice(0, 4)

      // photos: try fsq photos for top items (rate-limited)
      let photos: string[] = []
      if (i < MAX_ENRICH && id) {
        try {
          // ensure fsqPhotos returns Promise<string[]>
          const ph: string[] = (await fsqPhotos(id, 3)) as string[] // cast to string[]
          if (Array.isArray(ph) && ph.length > 0) {
            // filter out any falsy values and keep type as string[]
            photos = ph.filter((x): x is string => Boolean(x))
          }
        } catch (e) {
          // ignore photo fetch error
          console.warn("[fsq-places] photo fetch failed for", id, e)
        }
      }

      // fallback if no photos
      if (!photos || photos.length === 0) {
        photos = [unsplashFallback(name)]
      }

      places.push({
        id,
        name,
        lat: latp,
        lon: lonp,
        categories,
        photos,
        distanceMeters: p?.distance ?? null,
        raw: p,
      })
    }

    // simple shuffle and return
    for (let i = places.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[places[i], places[j]] = [places[j], places[i]]
    }

    return NextResponse.json({ ok: true, places })
  } catch (err: any) {
    console.error("[fsq-places] error", err)
    return NextResponse.json({ error: err?.message ?? "server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // a GET fallback so you can quickly test via browser
  return NextResponse.json({ ok: true, message: "/api/fsq-places ready (POST lat/lon/radius/vibes)" })
}
