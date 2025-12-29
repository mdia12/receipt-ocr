import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials missing in client.");
    // We can't easily throw here without crashing the component render.
    // But createBrowserClient will throw anyway if we pass undefined.
    // Let's pass empty strings to avoid immediate crash, but it won't work.
    // Or better, throw a clear error.
    throw new Error("Supabase credentials missing");
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
