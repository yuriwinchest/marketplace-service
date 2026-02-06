import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Garantir que dotenv foi carregado antes de acessar as variáveis
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.Project_URL || ''
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  ''
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.Publishable_API_Key || ''
const supabaseKey = serviceRoleKey || anonKey

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY não configurados!')
}

if (!serviceRoleKey && (process.env.NODE_ENV || '').toLowerCase() === 'production') {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY ausente: o backend pode falhar em operações com RLS habilitado.',
  )
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
