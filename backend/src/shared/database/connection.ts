import { Pool } from 'pg'
import { config } from '../../config/unifiedConfig.js'

if (!config.db.host || !config.db.password) {
  throw new Error('DB_HOST/DB_PASSWORD ausentes. Esta conexao e usada apenas por scripts de manutencao/migracao.')
}

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  ssl: { rejectUnauthorized: false },
})
