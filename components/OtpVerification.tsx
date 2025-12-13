// components/OtpVerification.tsx
"use client";

import { useState } from "react";

export default function OtpVerification({
  email,
  action,
  onVerified,
  onCancel,
}: {
  email: string;
  action: "signup" | "login";
  onVerified: () => void;
  onCancel?: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const verify = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action, otp: code }),
      });
      
      if (!res.ok) {
        let errorMessage = "Invalid OTP";
        try {
          const errorJson = await res.json();
          errorMessage = errorJson?.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        setErr(errorMessage);
        return;
      }

      const json = await res.json();
      if (json?.error) {
        setErr(json.error);
      } else {
        onVerified();
      }
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded bg-slate-900/70 border border-slate-800">
      <p className="text-sm text-slate-300">Enter the 6-digit code sent to <strong>{email}</strong></p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="mt-3 w-full rounded border bg-slate-800 px-3 py-2"
        placeholder="123456"
      />
      {err && <p className="text-xs text-rose-400 mt-2">{err}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={verify} disabled={loading} className="rounded bg-emerald-500 px-3 py-2 text-sm">
          {loading ? "Verifying..." : "Verify"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="rounded border px-3 py-2 text-sm">Cancel</button>
        )}
      </div>
    </div>
  );
}
