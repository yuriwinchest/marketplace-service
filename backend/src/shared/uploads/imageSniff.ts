import crypto from 'node:crypto'

export type SniffedImage = {
  ext: 'jpg' | 'png' | 'webp'
  mime: 'image/jpeg' | 'image/png' | 'image/webp'
}

export function sniffImageType(buf: Buffer): SniffedImage | null {
  if (!buf || buf.length < 16) return null

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' }
  }

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' }
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buf[0] === 0x52 && // R
    buf[1] === 0x49 && // I
    buf[2] === 0x46 && // F
    buf[3] === 0x46 && // F
    buf[8] === 0x57 && // W
    buf[9] === 0x45 && // E
    buf[10] === 0x42 && // B
    buf[11] === 0x50 // P
  ) {
    return { ext: 'webp', mime: 'image/webp' }
  }

  return null
}

export function randomUploadBasename(): string {
  // No timestamp: avoid leaking upload time. Use an unguessable name to reduce enumeration.
  return crypto.randomBytes(20).toString('hex')
}
