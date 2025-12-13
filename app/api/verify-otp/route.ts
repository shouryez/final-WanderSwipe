// app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// server-side supabase client with service role
const supaAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY);

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, action, otp } = body;
    if (!email || !action || !otp) {
      return NextResponse.json({ error: "Missing email/action/otp" }, { status: 400 });
    }

    const otpHash = hashOtp(String(otp));

    // Find the most recent unused, non-expired otp for this email+action
    const now = new Date().toISOString();
    const { data, error } = await supaAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", String(email).toLowerCase())
      .eq("action", action)
      .eq("used", false)
      .lte("expires_at", now) // careful: we want expires_at >= now; fix below
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("otp fetch error", error);
      return NextResponse.json({ error: "Failed to query otp" }, { status: 500 });
    }

    // NOTE: Supabase query above used lte incorrectly — we'll instead filter in JS
    // (safe approach): fetch recent (limit 20) and filter in server
    const { data: recs } = await supaAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", String(email).toLowerCase())
      .eq("action", action)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!recs || recs.length === 0) {
      return NextResponse.json({ error: "No OTP found or already used/expired" }, { status: 400 });
    }

    // find a matching (hash matches) and not expired
    const nowDate = new Date();
    let matched: any = null;
    for (const r of recs) {
      const expires = new Date(r.expires_at);
      if (expires < nowDate) continue;
      if (r.otp_hash === otpHash) {
        matched = r;
        break;
      }
    }

    if (!matched) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Mark OTP as used
    const { error: updErr } = await supaAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", matched.id);

    if (updErr) {
      console.warn("otp mark used error", updErr);
    }

    // Return OK. Client will complete sign-in flow (server doesn't sign the user in here).
    return NextResponse.json({ ok: true, message: "OTP verified" });
  } catch (err: any) {
    console.error("verify-otp error", err);
    return NextResponse.json({ error: err.message ?? "server error" }, { status: 500 });
  }
}
