// wanderswipe/app/auth/set-password/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      // Update the user's password (user must be signed in)
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      // Update profile flag
      const user = data?.user ?? (data as any)?.user;
      const userId = user?.id;
      if (userId) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({ password_set: true })
          .eq("id", userId);
        if (updateErr) console.warn("profiles update error:", updateErr);
      }

      setMsg("Password set! Redirecting…");
      setTimeout(() => router.replace("/"), 800);
    } catch (err: any) {
      console.error("set password error:", err);
      setMsg(err?.message || "Could not set password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-10 max-w-md p-6">
      <h2 className="text-xl font-semibold">Set a password</h2>
      <p className="text-sm text-slate-400">Create a password you can use for future logins.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm">New password</label>
          <input
            type="password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="At least 6 characters"
          />
        </div>

        {msg && <p className="text-sm text-emerald-400">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
        >
          {loading ? "Saving..." : "Set password"}
        </button>
      </form>
    </section>
  );
}
