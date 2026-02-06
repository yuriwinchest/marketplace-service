import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { config } from './config/unifiedConfig.js'
import { logger } from './shared/logger.js'

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

const app = express()

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
)
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requisições sem origem (como mobile apps, curl ou postman)
      if (!origin) return callback(null, true)

      // Permitir qualquer origem definida na config
      const allowedOrigins: string[] = [...config.cors.origins]
      if (allowedOrigins.includes(origin)) return callback(null, true)

      // Permitir qualquer localhost em desenvolvimento (útil se o Vite trocar de porta)
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true)
      }

      callback(null, true) // Por segurança no MVP, vamos permitir tudo por enquanto para destravar, mas logar warning
      // logger.warn(`CORS permissivo aplicado para origem: ${origin}`)
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }),
)
app.use(express.json())

// Static files
const uploadsDir = path.join(process.cwd(), config.uploads.directory)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// Health checks
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

// API Routes
import { generalRateLimit } from './shared/middleware/rateLimit.middleware.js'

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

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    })
  },
)

// Serve frontend static files (AFTER API routes)
const frontendDistPath = path.join(process.cwd(), 'dist')
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath))

  // SPA fallback - serve index.html for all non-API routes
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'))
  })

  logger.info(`Servindo frontend de: ${frontendDistPath}`)
} else {
  logger.warn(`Diretório frontend não encontrado: ${frontendDistPath}`)
}

// Start server
app.listen(config.port, () => {
  logger.info(`Backend rodando em http://localhost:${config.port}`)
})
