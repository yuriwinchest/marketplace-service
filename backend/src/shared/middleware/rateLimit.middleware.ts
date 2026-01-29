import { Request, Response, NextFunction } from 'express'

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
    // Identificador: IP ou user ID
    const identifier = (req as any).user?.id || req.ip || req.headers['x-forwarded-for'] || 'unknown'

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
export const generalRateLimit = rateLimitMiddleware(100, 60000) // 100 req/min
export const strictRateLimit = rateLimitMiddleware(10, 60000) // 10 req/min
export const authRateLimit = rateLimitMiddleware(5, 60000) // 5 req/min para auth
