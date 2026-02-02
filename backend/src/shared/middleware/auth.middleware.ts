import type { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import { config } from '../../config/unifiedConfig.js'
import type { AuthUser, AuthedRequest } from '../types/auth.js'

const jwtLib =
  ((jwt as unknown as { default?: typeof jwt }).default as typeof jwt | undefined) ?? jwt

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    res.status(401).json({ success: false, error: 'Não autenticado' })
    return
  }

  try {
    const payload = jwtLib.verify(token, config.jwtSecret) as JwtPayload
    const sub = payload.sub
    const role = (payload as unknown as { role?: string }).role

    if (typeof sub !== 'string' || !role) {
      res.status(401).json({ success: false, error: 'Token inválido' })
      return
    }

    ; (req as AuthedRequest).user = { id: sub, role: role as AuthUser['role'] }
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido' })
  }
}
