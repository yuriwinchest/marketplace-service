import type { Request, Response, NextFunction } from 'express'
import { logger } from '../logger.js'

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  const userId = (req as any).user?.id

  res.on('finish', () => {
    const durationMs = Date.now() - start
    const status = res.statusCode

    logger.info('HTTP', {
      method: req.method,
      path: req.originalUrl,
      status,
      durationMs,
      ip: req.ip,
      userId: userId ?? null,
    })
  })

  next()
}

