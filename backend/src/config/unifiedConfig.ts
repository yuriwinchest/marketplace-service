import { loadEnv } from './loadEnv.js'

loadEnv()

export const config = {
  port: Number(process.env.PORT ?? '5000'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? '',
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
      'https://fazserviço.com.br',
      'http://fazserviço.com.br',
      'https://xn--fazservio-x3a.com.br',
      'http://xn--fazservio-x3a.com.br',
    ],
  },
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    directory: 'uploads',
  },
} as const

// Validação de configuração obrigatória
if (!Number.isFinite(config.port)) throw new Error('PORT inválida')
if (!Number.isFinite(config.db.port)) throw new Error('DB_PORT inválida')
if (!config.jwtSecret) throw new Error('JWT_SECRET ausente')
if (!config.db.host) throw new Error('DB_HOST ausente')
if (!config.db.password) throw new Error('DB_PASSWORD ausente')
