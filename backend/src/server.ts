import { config } from './config/unifiedConfig.js'
import { logger } from './shared/logger.js'
import { createApp } from './app.js'

const app = createApp()

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Backend rodando em http://localhost:${config.port}`)
})

// Graceful shutdown (important on VPS, PM2, Docker, k8s).
const shutdown = (signal: string) => {
  logger.info(`Recebido ${signal}. Encerrando servidor...`)
  server.close(() => {
    logger.info('Servidor encerrado.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
