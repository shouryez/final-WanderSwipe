import { createBrowserClient } from "@supabase/ssr";

// For client components - creates a browser client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Pre-configured client instance (for backward compatibility)
export const supabase = createClient();
