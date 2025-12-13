// wanderswipe/lib/foursquareClient.ts
// Foursquare (Places API v3) wrapper — normalized output for Explore page
// Docs: https://docs.foursquare.com/developer/reference/place-search and authentication header usage.
// Use FSQ_API_KEY in server environment

type RawSearchFeature = any

const BASE = process.env.FSQ_BASE ?? "https://api.foursquare.com/v3/places"
const KEY = process.env.FSQ_API_KEY ?? ""

function headers() {
  return {
    Accept: "application/json",
    Authorization: KEY, // Foursquare expects the API key in Authorization header
  }
}

export type Place = {
  id: string // fsq_id
  name: string
  lat: number
  lng: number
  categories: string[] // textual categories
  distanceMeters?: number
  rating?: number | null // if available
  image?: string | null // preview or photo URL
  raw?: any // raw object for debugging
}

function parseSearchFeature(f: RawSearchFeature): Place {
  const props = f?.properties ?? f // some shapes
  const geoc = f?.geometry?.coordinates
  const lat = geoc ? geoc[1] : (props.lat ?? props.latitude ?? 0)
  const lng = geoc ? geoc[0] : (props.lon ?? props.longitude ?? 0)
  // categories may be an array of objects (v3) or comma string; normalize to text names
  let cats: string[] = []
  if (Array.isArray(props.categories)) {
    cats = props.categories.map((c: any) => (c?.name ?? "").toLowerCase()).filter(Boolean)
  } else if (props.kinds) {
    cats = String(props.kinds)
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean)
  }
  return {
    id: props.fsq_id ?? props.xid ?? props.id ?? props.name ?? Math.random().toString(36).slice(2, 9),
    name: props.name ?? "Unknown",
    lat: Number(lat ?? 0),
    lng: Number(lng ?? 0),
    categories: cats,
    distanceMeters: props.dist ?? props.distance ?? undefined,
    rating: props.rating ?? null,
    image: null,
    raw: f,
  }
}

/**
 * Search nearby places using Foursquare /v3/places/search
 * - lat, lng in decimal degrees
 * - radiusMeters: integer (max uses depend on API)
 * - limit: number of results
 * - queryOrCategory: optional string to bias search ("beach", "pub", "museum")
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusMeters = 50000,
  limit = 100,
  queryOrCategory?: string,
): Promise<Place[]> {
  if (!KEY) throw new Error("Foursquare API key not set (FSQ_API_KEY)")

  const url = new URL(`${BASE}/search`)
  url.searchParams.set("ll", `${lat},${lng}`)
  url.searchParams.set("radius", String(radiusMeters))
  url.searchParams.set("limit", String(limit))

  // optional query: searches for name/category/text
  if (queryOrCategory) {
    url.searchParams.set("query", queryOrCategory)
  }

  // Optional: you may add categories numeric ids with 'categories=' param if you want exact categories.
  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Foursquare search error ${res.status}: ${text}`)
  }
  const json = await res.json()
  // v3 returns array in `results` or `features`
  const features = json.results ?? json.features ?? json
  const places = (Array.isArray(features) ? features : []).map(parseSearchFeature)
  return places
}

/**
 * Fetch place details (for extra metadata, rating, or timezone)
 * Endpoint: /v3/places/{fsq_id}
 */
export async function fetchPlaceDetails(fsq_id: string): Promise<any> {
  if (!KEY) throw new Error("Foursquare API key not set (FSQ_API_KEY)")
  const url = `${BASE}/${encodeURIComponent(fsq_id)}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Place details error ${res.status}: ${t}`)
  }
  return await res.json()
}

/**
 * Fetch photos for a place (v3 photos endpoint)
 * Endpoint: /v3/places/{fsq_id}/photos
 * Returns an array of photo metadata — we build a usable URL if possible.
 */
export async function fetchPlacePhotos(fsq_id: string, limit = 5): Promise<string[]> {
  if (!KEY) throw new Error("Foursquare API key not set (FSQ_API_KEY)")
  const url = `${BASE}/${encodeURIComponent(fsq_id)}/photos?limit=${limit}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    // 404 or no photos -> return empty
    return []
  }
  const json = await res.json()
  // v3 photo objects often provide 'prefix' and 'suffix' to assemble URL: prefix + size + suffix
  // Example: { prefix: "https://fastly.4sqi.net/img/general/", suffix: "/12345.jpg" }
  // We'll try to build size "original" or "1200x800"
  if (!Array.isArray(json)) return []
  const urls: string[] = json
    .map((p: any) => {
      if (p.prefix && p.suffix) {
        // you can choose size like "original" or "1200x800"
        const size = "original"
        return `${p.prefix}${size}${p.suffix}`
      }
      if (p?.url) return p.url
      return null
    })
    .filter(Boolean) as string[]
  return urls
}
