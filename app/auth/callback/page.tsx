// wanderswipe/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying...");

  useEffect(() => {
    const handle = async () => {
      try {
        const authAny = supabase.auth as any;

        // Try to let SDK detect/parse session in URL first
        if (typeof authAny.getSessionFromUrl === "function") {
          await authAny.getSessionFromUrl({ storeSession: true }).catch(() => null);
        }

        // Ensure session exists
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session ?? (sessionData as any);

        if (!session || !session.user) {
          // fallback: try parsing hash/search for tokens
          const hash = window.location.hash || "";
          const search = window.location.search || "";
          const allParams = (hash + "&" + search).replace(/^#/, "");
          const params = new URLSearchParams(allParams);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && typeof authAny.setSession === "function") {
            await authAny.setSession({ access_token, refresh_token }).catch(() => null);
          }
        }

        // Now get the user again
        const { data: after } = await supabase.auth.getSession();
        const finalSession = after?.session ?? (after as any);
        const user = finalSession?.user;

        if (!user) {
          setStatus("error");
          setMessage("Could not sign you in automatically. Please log in.");
          return;
        }

        // Check or create profile row
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("password_set")
          .eq("id", user.id)
          .limit(1)
          .maybeSingle();

        if (profileErr) {
          console.warn("profiles read error:", profileErr);
        }

        // If no profile row, create one with password_set = false
        if (!profileData) {
          const { error: insertErr } = await supabase.from("profiles").insert({
            id: user.id,
            password_set: false,
          });
          if (insertErr) console.warn("profiles insert error:", insertErr);
          // redirect user to set-password
          router.replace("/auth/set-password");
          return;
        }

        // If profile exists but password_set is false → prompt set-password
        if (profileData?.password_set === false) {
          router.replace("/auth/set-password");
          return;
        }

        // Otherwise user already has password set — go to home
        router.replace("/");
      } catch (err: any) {
        console.error("callback error:", err);
        setStatus("error");
        setMessage("Could not parse auth response. Please log in manually.");
      }
    };

    handle();
  }, [router]);

  return (
    <div className="mx-auto max-w-md p-6">
      {status === "loading" && <p>{message}</p>}
      {status === "error" && (
        <>
          <p className="text-red-500">{message}</p>
          <p className="mt-4">Go to <a href="/" className="underline">home</a> and try logging in.</p>
        </>
      )}
    </div>
  );
}
