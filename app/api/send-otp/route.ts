// app/api/send-otp/route.ts  (SendGrid HTTP API version with robust FROM env handling + debug logs)
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? "";

// Prefer separate env vars to avoid quoting/angle-bracket parsing problems
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME ?? "WanderSwipe";
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? process.env.EMAIL_FROM ?? "";

// Build FROM string
const FROM = EMAIL_FROM_ADDRESS ? `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>` : (process.env.EMAIL_FROM ?? "WanderSwipe <no-reply@localhost>");
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Debug logs so you can confirm what the server sees (will print in Next server console)
console.log("[send-otp:init] SUPA_URL set:", !!SUPA_URL);
console.log("[send-otp:init] SUPA_SERVICE_KEY set:", !!SUPA_SERVICE_KEY);
console.log("[send-otp:init] SENDGRID_API_KEY set:", !!SENDGRID_API_KEY);
console.log("[send-otp:init] EMAIL_FROM_NAME:", EMAIL_FROM_NAME);
console.log("[send-otp:init] EMAIL_FROM_ADDRESS:", EMAIL_FROM_ADDRESS ? "[SET]" : "[NOT SET]");
console.log("[send-otp:init] FROM (final):", FROM);

if (!SUPA_URL || !SUPA_SERVICE_KEY) {
  console.error("[send-otp:init] Missing Supabase env for send-otp route");
}
if (!SENDGRID_API_KEY) {
  console.error("[send-otp:init] Missing SENDGRID_API_KEY in env");
}
if (!EMAIL_FROM_ADDRESS) {
  console.warn("[send-otp:init] WARNING: EMAIL_FROM_ADDRESS not set; emails may be rejected by SendGrid");
}

const supaAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY);

function generateOtp(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
  return otp;
}
function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, action } = body ?? {};
    if (!email || !action) {
      return NextResponse.json({ error: "Missing email or action" }, { status: 400 });
    }

    // rate-limit (optional): max 5 sends per hour
    try {
      const recent = await supaAdmin
        .from("otp_codes")
        .select("id,created_at")
        .eq("email", String(email).toLowerCase())
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
      if (recent?.data && recent.data.length >= 5) {
        return NextResponse.json({ error: "Too many OTP requests recently. Try later." }, { status: 429 });
      }
    } catch (e) {
      // ignore rate-check failures
      console.warn("[send-otp] rate-check failed", e);
    }

    const otp = generateOtp(6);
    const otpHash = hashOtp(otp);
    const ttlMinutes = body.ttlMinutes ?? 10;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    // insert otp record
    const { error: insertErr } = await supaAdmin
      .from("otp_codes")
      .insert([{ email: String(email).toLowerCase(), action, otp_hash: otpHash, expires_at: expiresAt }]);

    if (insertErr) {
      console.error("[send-otp] otp insert error", insertErr);
      return NextResponse.json({ error: "Failed to store otp" }, { status: 500 });
    }

    // Build SendGrid message payload
    const payload = {
      personalizations: [
        {
          to: [{ email }],
          subject: "Your WanderSwipe verification code",
        },
      ],
      from: {
        email: (EMAIL_FROM_ADDRESS || FROM.match(/<(.+?)>/)?.[1] || "").toString(),
        name: EMAIL_FROM_NAME || (FROM.split("<")[0].trim() || "WanderSwipe"),
      },
      content: [
        {
          type: "text/plain",
          value: `Your WanderSwipe verification code is: ${otp} (expires in ${ttlMinutes} minutes)`,
        },
        {
          type: "text/html",
          value: `<p>Your verification code for <strong>WanderSwipe</strong> is:</p><h2 style="letter-spacing:6px">${otp}</h2><p>This code will expire in ${ttlMinutes} minutes.</p>`,
        },
      ],
    };

    if (!SENDGRID_API_KEY) {
      console.error("[send-otp] No SENDGRID_API_KEY available - aborting send");
      return NextResponse.json({ error: "Email sending not configured (missing API key)" }, { status: 500 });
    }

    // send via SendGrid REST API
    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!sgRes.ok) {
      const text = await sgRes.text();
      console.error("[send-otp] SendGrid API error:", sgRes.status, text);
      return NextResponse.json({ error: "Failed to send email (SendGrid)", detail: text }, { status: 502 });
    }

    // success
    console.log(`[send-otp] OTP sent to ${email} (queued)`);
    return NextResponse.json({ ok: true, message: "OTP sent via SendGrid API" });
  } catch (err: any) {
    console.error("[send-otp] send-otp exception", err);
    return NextResponse.json({ error: err?.message ?? "server error" }, { status: 500 });
  }
}
