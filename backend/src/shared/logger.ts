
import winston from 'winston'
import { config } from '../config/unifiedConfig.js'

const { combine, timestamp, printf, colorize, json } = winston.format

// Formato para desenvolvimento (cores, texto legível)
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`
    }
    return msg
})

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // 'debug' em dev, 'info' em prod
    format: combine(
        timestamp(),
        // Em produção, usar JSON para facilitar ingestão (Datadog, AWS CloudWatch, etc)
        process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)
    ),
    transports: [
        new winston.transports.Console(),
        // Em um cenário real, poderíamos adicionar File transport ou HTTP transport
    ],
})

// Stream para integrar com Morgan (se usado)
export const stream = {
    write: (message: string) => {
        logger.info(message.trim())
    },
}
