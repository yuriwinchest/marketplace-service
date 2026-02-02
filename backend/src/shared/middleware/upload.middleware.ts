import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { config } from '../../config/unifiedConfig.js'

const uploadsDir = path.join(process.cwd(), config.uploads.directory)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, uniqueName)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if ((config.uploads.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo não permitido'))
    }
  },
})
