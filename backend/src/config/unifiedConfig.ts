import { loadEnv } from './loadEnv.js'

loadEnv()

export const config = {
  port: Number(process.env.PORT ?? '5000'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // DB connection details are only required for migration/maintenance scripts.
  db: {
    host: process.env.DB_HOST ?? '',
    port: Number(process.env.DB_PORT ?? '5432'),
    name: process.env.DB_NAME ?? 'postgres',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? process.env.senh ?? '',
  },
  cors: {
    origins: [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://fazservico.com',
      'http://fazservico.com',
      'https://www.fazservico.com',
      'http://www.fazservico.com',
      'https://fazservico.com.br',
      'http://fazservico.com.br',
      'https://xn--fazservio-x3a.com.br',
      'http://xn--fazservio-x3a.com.br',
    ],
  },
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    // Restrict to formats we can safely normalize server-side.
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    directory: 'uploads',
  },
} as const

// Minimal runtime validation (do not require DB creds for the API process).
if (!Number.isFinite(config.port)) throw new Error('PORT invalida')
if (!Number.isFinite(config.db.port)) throw new Error('DB_PORT invalida')
