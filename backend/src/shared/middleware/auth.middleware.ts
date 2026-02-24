import type { Request, Response, NextFunction } from 'express'
import type { AuthUser, AuthedRequest } from '../types/auth.js'
import { supabaseAnon } from '../database/supabaseClient.js'
import { createSupabaseRlsClient } from '../database/supabaseRlsClient.js'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const header = req.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    res.status(401).json({ success: false, error: 'Nao autenticado' })
    return
  }

  try {
    // Validate Supabase access token and map it to internal `public.users.id` (Plan B).
    const { data, error } = await supabaseAnon.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ success: false, error: 'Token invalido' })
      return
    }

    const authUserId = data.user.id
    const rlsDb = createSupabaseRlsClient(token)

    const { data: mapping, error: mappingError } = await rlsDb
      .from('user_identities')
      .select('user_id')
      .eq('auth_user_id', authUserId)
      .single()

    if (mappingError || !mapping?.user_id) {
      res.status(401).json({ success: false, error: 'Conta nao vinculada' })
      return
    }

    const { data: internalUser, error: userError } = await rlsDb
      .from('users')
      .select('id, role')
      .eq('id', mapping.user_id)
      .single()

    if (userError || !internalUser) {
      res.status(401).json({ success: false, error: 'Usuario nao encontrado' })
      return
    }

    const authedReq = req as AuthedRequest
    authedReq.user = {
      id: internalUser.id,
      role: internalUser.role as AuthUser['role'],
    }
    authedReq.accessToken = token
    authedReq.db = rlsDb

    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token invalido' })
  }
}

