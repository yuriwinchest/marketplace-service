import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { loadEnv } from '../../config/loadEnv.js'

// Garantir que `.env` foi carregado antes de acessar as variáveis
loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.Project_URL || ''
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  ''
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.Publishable_API_Key || ''
const adminKey = serviceRoleKey || anonKey

if (!supabaseUrl || !anonKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY não configurados!')
}

if (!serviceRoleKey && (process.env.NODE_ENV || '').toLowerCase() === 'production') {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY ausente: o backend pode falhar em operações com RLS habilitado.',
  )
}

// Anonymous client: use for Supabase Auth operations and any RLS-enforced reads if desired.
export const supabaseAnon: SupabaseClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

// Admin client: service-role (when available). Used for privileged DB writes / migrations / admin tasks.
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, adminKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

// Backwards-compatible default: existing code imports `supabase` expecting admin-like access.
export const supabase: SupabaseClient = supabaseAdmin
