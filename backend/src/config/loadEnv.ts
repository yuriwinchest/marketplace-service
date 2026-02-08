import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

// Loads environment variables in a predictable way.
// 1) Try `.env` in the current working directory.
// 2) If a parent `.env` exists (common repo-root setup), load it too (non-overriding).
// 3) Allow overriding the path via `DOTENV_CONFIG_PATH`.
export function loadEnv(): void {
  const explicitPath = process.env.DOTENV_CONFIG_PATH
  if (explicitPath) {
    dotenv.config({ path: explicitPath })
    return
  }

  // Load cwd .env first.
  dotenv.config()

  // If running from `backend/`, also load repo-root `.env` for missing variables.
  const parentEnv = path.resolve(process.cwd(), '..', '.env')
  if (fs.existsSync(parentEnv)) {
    dotenv.config({ path: parentEnv })
  }
}

