import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!); 
// Use service key for server routes OR create anon key and use Row Level Security appropriately 

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const radiusKm = Number(url.searchParams.get("radius") || 200);
  try {
    // simple geo filter using bounding box for speed (or use PostGIS)
    const res = await supabase
      .from("destinations")
      .select("*");
    if (res.error) throw res.error;

    const places = (res.data || []).map((p: any) => ({
      ...p
    }));
    return NextResponse.json({ places });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
