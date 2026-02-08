import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loadEnv } from '../../config/loadEnv.js'

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.Project_URL || ''
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.Publishable_API_Key || ''

if (!supabaseUrl || !anonKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY não configurados!')
}

export function createSupabaseRlsClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

