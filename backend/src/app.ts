import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'
import fs from 'fs'
import { config } from './config/unifiedConfig.js'
import { logger } from './shared/logger.js'
import { requestLoggerMiddleware } from './shared/middleware/requestLogger.middleware.js'

// Routes
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import categoriesRoutes from './modules/categories/categories.routes.js'
import regionsRoutes from './modules/regions/regions.routes.js'
import servicesRoutes from './modules/services/services.routes.js'
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes.js'
import proposalsRoutes from './modules/proposals/proposals.routes.js'
import contactRoutes from './modules/contact/contact.routes.js'
import notificationsRoutes from './modules/notifications/notifications.routes.js'
import ratingsRoutes from './modules/ratings/ratings.routes.js'

import { generalRateLimit } from './shared/middleware/rateLimit.middleware.js'

export const createApp = (opts?: { serveFrontend?: boolean }) => {
  const app = express()

  // When behind Nginx/Cloudflare, trust proxy is required for correct req.ip and secure cookies.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(requestLoggerMiddleware)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  )
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests without Origin (mobile apps, curl, server-to-server).
        if (!origin) return callback(null, true)

        const allowedOrigins: string[] = [...config.cors.origins]

        // Allow any localhost during development (Vite port changes).
        if (
          config.nodeEnv !== 'production' &&
          (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
        ) {
          return callback(null, true)
        }

        if (allowedOrigins.includes(origin)) return callback(null, true)

        // In production, reject unknown origins.
        if (config.nodeEnv === 'production') {
          return callback(new Error('CORS: origem não permitida'), false)
        }

        // In dev, allow but log (helps unblock during local testing).
        logger.warn(`CORS permissivo (dev) aplicado para origem: ${origin}`)
        return callback(null, true)
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    }),
  )
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))

  // Static files (uploads)
  const uploadsDir = path.join(process.cwd(), config.uploads.directory)
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  app.use('/uploads', express.static(uploadsDir, { maxAge: config.nodeEnv === 'production' ? '7d' : 0 }))

  // Health checks
  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  // API Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/users', generalRateLimit, usersRoutes)
  app.use('/api/categories', generalRateLimit, categoriesRoutes)
  app.use('/api/regions', generalRateLimit, regionsRoutes)
  app.use('/api/requests', generalRateLimit, servicesRoutes)
  app.use('/api/subscriptions', generalRateLimit, subscriptionsRoutes)
  app.use('/api/proposals', generalRateLimit, proposalsRoutes)
  app.use('/api/contact', generalRateLimit, contactRoutes)
  app.use('/api/notifications', generalRateLimit, notificationsRoutes)
  app.use('/api/ratings', generalRateLimit, ratingsRoutes)

  // Error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      logger.error(`[ERROR] ${err.message}`, { stack: err.stack })

      if (err.message === 'Tipo de arquivo não permitido') {
        return res.status(400).json({
          success: false,
          error: 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.',
        })
      }

      if (err.message.includes('LIMIT_FILE_SIZE')) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo muito grande (max 5MB)',
        })
      }

      if (err.message.startsWith('CORS:')) {
        return res.status(403).json({
          success: false,
          error: err.message,
        })
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    },
  )

  // Serve frontend static files (AFTER API routes)
  const shouldServeFrontend = opts?.serveFrontend !== false
  if (shouldServeFrontend) {
    const frontendDistPath = path.join(process.cwd(), 'dist')
    if (fs.existsSync(frontendDistPath)) {
      app.use(express.static(frontendDistPath, { maxAge: config.nodeEnv === 'production' ? '1h' : 0 }))

      // SPA fallback - serve index.html for all non-API routes
      app.use((_req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'))
      })

      logger.info(`Servindo frontend de: ${frontendDistPath}`)
    } else {
      logger.warn(`Diretório frontend não encontrado: ${frontendDistPath}`)
    }
  }

  return app
}

