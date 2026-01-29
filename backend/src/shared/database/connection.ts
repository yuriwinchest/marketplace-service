import { Pool } from 'pg'
import { config } from '../../config/unifiedConfig.js'

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  ssl: { rejectUnauthorized: false },
})
