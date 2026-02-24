import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { loadEnv } from '../../config/loadEnv.js'

// Ensure `.env` is loaded before accessing env vars.
loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.Project_URL || ''
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.Publishable_API_Key || ''

let client: SupabaseClient

if (!supabaseUrl || !anonKey) {
  // Avoid throwing here so local tooling can still run; routes that need Supabase will fail gracefully.
  console.error('SUPABASE_URL ou SUPABASE_ANON_KEY nao configurados!')
  
  // Create a mock client that throws helpful errors when accessed
  const throwError = () => {
    throw new Error('Supabase client nao inicializado. Verifique SUPABASE_URL e SUPABASE_ANON_KEY no .env')
  }
  
  client = {
    from: throwError,
    auth: {
      signInWithPassword: throwError,
      signUp: throwError,
      signOut: throwError,
      getSession: throwError,
      getUser: throwError,
      // Add other methods as needed or use Proxy
    },
    // Add other properties as needed
  } as unknown as SupabaseClient
} else {
  // Anonymous client: use for Supabase Auth operations and any public RLS-enforced reads.
  client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

export const supabaseAnon: SupabaseClient = client

// Backwards-compatible alias: some modules import `supabase`.
// Intentionally no service-role client in the API runtime for security.
export const supabase: SupabaseClient = supabaseAnon
