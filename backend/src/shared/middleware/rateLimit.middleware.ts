import type { Request, Response, NextFunction } from 'express'
import { config } from '../../config/unifiedConfig.js'

interface RateLimitStore {
  [key: string]: number[]
}

class RateLimiter {
  private requests: RateLimitStore = {}

  checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
  ): boolean {
    const now = Date.now()
    const requests = this.requests[identifier] || []

    // Remove requisições antigas fora da janela
    const recentRequests = requests.filter((time) => now - time < windowMs)

    if (recentRequests.length >= maxRequests) {
      return false // Rate limit excedido
    }

    // Adicionar requisição atual
    recentRequests.push(now)
    this.requests[identifier] = recentRequests

    // Limpar dados antigos periodicamente (simplificado)
    if (Object.keys(this.requests).length > 10000) {
      this.cleanup()
    }

    return true
  }

  private cleanup(): void {
    const now = Date.now()
    const maxAge = 3600000 // 1 hora

    for (const [key, requests] of Object.entries(this.requests)) {
      const recent = requests.filter((time) => now - time < maxAge)
      if (recent.length === 0) {
        delete this.requests[key]
      } else {
        this.requests[key] = recent
      }
    }
  }
}

const limiter = new RateLimiter()

export const rateLimitMiddleware = (
  maxRequests: number,
  windowMs: number,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Identifier: authenticated userId when present, otherwise client IP.
    // `trust proxy` must be enabled on the app for correct `req.ip` behind Nginx.
    const userId = (req as any).user?.id as string | undefined
    const ip = req.ip || 'unknown'
    const identifier = userId ? `user:${userId}` : `ip:${ip}`

    const allowed = limiter.checkLimit(identifier, maxRequests, windowMs)

    if (!allowed) {
      res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.',
      })
      return
    }

    next()
  }
}

// Middlewares pré-configurados
const isProd = (config.nodeEnv || '').toLowerCase() === 'production'
export const generalRateLimit = rateLimitMiddleware(isProd ? 100 : 1000, 60000) // req/min
export const strictRateLimit = rateLimitMiddleware(isProd ? 20 : 200, 60000) // req/min
export const authRateLimit = rateLimitMiddleware(isProd ? 10 : 100, 60000) // req/min
