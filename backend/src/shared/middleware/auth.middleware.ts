import type { Request, Response, NextFunction } from 'express'
import type { AuthUser, AuthedRequest } from '../types/auth.js'
import { supabaseAnon, supabaseAdmin } from '../database/supabaseClient.js'
import { createSupabaseRlsClient } from '../database/supabaseRlsClient.js'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const header = req.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    res.status(401).json({ success: false, error: 'Não autenticado' })
    return
  }

  try {
    // Validate Supabase access token and map it to internal `public.users.id` (Plan B).
    const { data, error } = await supabaseAnon.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ success: false, error: 'Token inválido' })
      return
    }

    const authUserId = data.user.id

    const { data: mapping, error: mappingError } = await supabaseAdmin
      .from('user_identities')
      .select('user_id')
      .eq('auth_user_id', authUserId)
      .single()

    if (mappingError || !mapping?.user_id) {
      res.status(401).json({ success: false, error: 'Conta não vinculada' })
      return
    }

    const { data: internalUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', mapping.user_id)
      .single()

      if (userError || !internalUser) {
        res.status(401).json({ success: false, error: 'Usuário não encontrado' })
        return
      }

      const authedReq = req as AuthedRequest
      authedReq.user = {
        id: internalUser.id,
        role: internalUser.role as AuthUser['role'],
      }
      authedReq.accessToken = token
      authedReq.db = createSupabaseRlsClient(token)

    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido' })
  }
}
