import dotenv from 'dotenv'
import { Client } from 'pg'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

dotenv.config()

const resolveProjectRefFromUrl = (raw?: string) => {
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    const hostname = url.hostname
    const [subdomain] = hostname.split('.')
    return subdomain || undefined
  } catch {
    return undefined
  }
}

const getDbConfig = () => {
  const projectRef = resolveProjectRefFromUrl(process.env.Project_URL)
  const host = process.env.DB_HOST ?? (projectRef ? `db.${projectRef}.supabase.co` : undefined)
  const port = Number(process.env.DB_PORT ?? '5432')
  const database = process.env.DB_NAME ?? 'postgres'
  const user = process.env.DB_USER ?? 'postgres'
  const password = process.env.DB_PASSWORD ?? process.env.senh

  if (!host) throw new Error('DB_HOST ausente (ou Project_URL inválida)')
  if (!Number.isFinite(port)) throw new Error('DB_PORT inválida')
  if (!password) throw new Error('DB_PASSWORD ausente (ou senh ausente)')

  return { host, port, database, user, password }
}

const migrationsDir = path.join(process.cwd(), 'migrations')

const main = async () => {
  const db = getDbConfig()
  const client = new Client(db)

  await client.connect()

  try {
    await client.query(`
      create table if not exists public.schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      );
    `)

    const applied = await client.query<{ name: string }>(
      `select name from public.schema_migrations order by name asc;`,
    )
    const appliedNames = new Set(applied.rows.map((r) => r.name))

    const files = (await readdir(migrationsDir))
      .filter((f) => f.toLowerCase().endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b))

    for (const file of files) {
      if (appliedNames.has(file)) continue

      const fullPath = path.join(migrationsDir, file)
      const sql = await readFile(fullPath, 'utf8')

      await client.query('begin')
      try {
        await client.query(sql)
        await client.query(`insert into public.schema_migrations (name) values ($1);`, [file])
        await client.query('commit')
        console.log(`Applied migration: ${file}`)
      } catch (err) {
        await client.query('rollback')
        throw err
      }
    }

    console.log('Migrations concluídas.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Falha ao aplicar migrations.')
  console.error(err)
  process.exitCode = 1
})

