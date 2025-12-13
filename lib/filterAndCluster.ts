// wanderswipe/lib/filterAndCluster.ts
import { Place } from "./foursquareClient";

function toRad(v:number){ return v * Math.PI / 180; }
function haversineKm(aLat:number,aLon:number,bLat:number,bLon:number){
  const R=6371;
  const dLat=toRad(bLat-aLat), dLon=toRad(bLon-aLon);
  const A=Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1-A));
}

export type Cluster = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  places: Place[];
  categories: string[];
  representative: Place;
  distanceKm?: number;
};

// Broader allow-list so we keep more travel-worthy places from Foursquare
const CATEGORY_WHITELIST = [
  "beach",
  "nightlife",
  "pub",
  "bar",
  "restaurant",
  "waterfall",
  "park",
  "national park",
  "garden",
  "museum",
  "temple",
  "fort",
  "palace",
  "viewpoint",
  "trail",
  "hike",
  "mountain",
  "camp",
  "market",
  "church",
  "historic",
  "monument",
  "lake",
  "river",
  "island",
  "resort",
  "tourist",
  "attraction",
];

const CATEGORY_BLOCKLIST = [
  "office",
  "atm",
  "bank",
  "hospital",
  "pharmacy",
  "school",
  "university",
  "apartment",
  "residential",
  "car dealer",
  "car rental",
  "gas station",
  "parking",
  "supermarket",
  "convenience",
  "bus station",
  "train station",
];

function hasGoodCategory(p: Place){
  if (!p.categories || p.categories.length === 0) return false;
  return p.categories.some(c => CATEGORY_WHITELIST.some(w => c.includes(w)));
}

function hasBlockedCategory(p: Place){
  if (!p.categories || p.categories.length === 0) return false;
  return p.categories.some(c => CATEGORY_BLOCKLIST.some(w => c.includes(w)));
}

function isUseful(p: Place){
  if (!p.name || p.name.length < 2) return false;
  if (hasBlockedCategory(p)) return false;
  // keep if has good category or at least some category context
  if (hasGoodCategory(p)) return true;
  if (p.categories && p.categories.length > 0) return true;
  if (p.image) return true;
  if (p.rating && p.rating > 2) return true;
  // allow a small fraction of uncategorised POIs so the feed is not empty
  return true;
}

export function dedupeAndCluster(places: Place[], maxClusterRadiusKm = 3, userLat?: number, userLng?: number): Cluster[] {
  const filtered = places.filter(isUseful);

  // sort by rating/popularity (desc) then proximity (if available)
  filtered.sort((a,b) => {
    const ra = (a.rating ?? 0);
    const rb = (b.rating ?? 0);
    if (rb !== ra) return rb - ra;
    if (userLat != null && userLng != null && a.distanceMeters != null && b.distanceMeters != null) {
      return (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999);
    }
    return 0;
  });

  const clusters: Cluster[] = [];
  for (const p of filtered) {
    let placed = false;
    for (const c of clusters) {
      const d = haversineKm(p.lat, p.lng, c.lat, c.lng);
      if (d <= maxClusterRadiusKm) {
        c.places.push(p);
        c.categories = Array.from(new Set(c.categories.concat(p.categories)));
        if ((p.rating ?? 0) > (c.representative.rating ?? 0)) c.representative = p;
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        places: [p],
        categories: p.categories.slice(),
        representative: p,
      });
    }
  }

  if (userLat != null && userLng != null) {
    for (const c of clusters) {
      c.distanceKm = +haversineKm(userLat, userLng, c.lat, c.lng).toFixed(2);
    }
    clusters.sort((a,b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
  }

  return clusters;
}
