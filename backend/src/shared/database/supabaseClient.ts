import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Garantir que dotenv foi carregado antes de acessar as variáveis
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.Project_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.Publishable_API_Key || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY não configurados!')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
