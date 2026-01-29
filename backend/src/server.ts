import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { config } from './config/unifiedConfig.js'

// Routes
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import categoriesRoutes from './modules/categories/categories.routes.js'
import regionsRoutes from './modules/regions/regions.routes.js'
import servicesRoutes from './modules/services/services.routes.js'
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes.js'
import proposalsRoutes from './modules/proposals/proposals.routes.js'
import contactRoutes from './modules/contact/contact.routes.js'

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
    origin: config.cors.origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[ERROR]', err.message)

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

// Start server
app.listen(config.port, () => {
  console.log(`Backend rodando em http://localhost:${config.port}`)
})
