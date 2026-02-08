import multer from 'multer'
import fs from 'fs'
import path from 'path'
import type { RequestHandler } from 'express'
import { config } from '../../config/unifiedConfig.js'
import { randomUploadBasename, sniffImageType } from '../uploads/imageSniff.js'

const uploadsDir = path.join(process.cwd(), config.uploads.directory)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export const upload = multer({
  // Memory storage lets us validate by content (magic bytes) before persisting to disk.
  storage: multer.memoryStorage(),
  limits: { fileSize: config.uploads.maxFileSize },
  fileFilter: (_req, file, cb) => {
    // Do NOT trust mimetype for security. Accept common cases and validate by content later.
    // Some clients send application/octet-stream for images.
    if (!file.mimetype || file.mimetype === 'application/octet-stream') return cb(null, true)
    if ((config.uploads.allowedMimeTypes as readonly string[]).includes(file.mimetype)) return cb(null, true)
    return cb(new Error('Tipo de arquivo não permitido'))
  },
})

export const persistUploadedImage: RequestHandler = async (req, _res, next) => {
  try {
    const file = (req as any).file as { buffer?: Buffer; mimetype?: string } | undefined
    if (!file) return next()

    const buf = file.buffer
    if (!buf || !Buffer.isBuffer(buf) || buf.length === 0) {
      return next(new Error('Arquivo inválido ou corrompido'))
    }

    const sniffed = sniffImageType(buf)
    if (!sniffed) {
      return next(new Error('Arquivo inválido ou corrompido'))
    }

    // Enforce allowlist by detected type, not by user-provided mimetype/ext.
    if (!(config.uploads.allowedMimeTypes as readonly string[]).includes(sniffed.mime)) {
      return next(new Error('Tipo de arquivo não permitido'))
    }

    const basename = randomUploadBasename()
    const filename = `${basename}.${sniffed.ext}`
    const fullPath = path.join(uploadsDir, filename)

    await fs.promises.writeFile(fullPath, buf)

    // Normalize the file metadata so existing controllers keep working.
    ;(req as any).file = {
      ...(req as any).file,
      filename,
      path: fullPath,
      destination: uploadsDir,
      mimetype: sniffed.mime,
      size: buf.length,
    }

    return next()
  } catch (err) {
    return next(err as Error)
  }
}
