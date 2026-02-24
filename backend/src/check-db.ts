import { loadEnv } from './config/loadEnv.js'
import { Client } from 'pg'

loadEnv()

const getDbConfig = () => {
  const host = process.env.DB_HOST
  const port = Number(process.env.DB_PORT ?? '5432')
  const database = process.env.DB_NAME ?? 'postgres'
  const user = process.env.DB_USER ?? 'postgres'
  const password = process.env.DB_PASSWORD ?? process.env.senh

  if (!host) throw new Error('DB_HOST ausente')
  if (!Number.isFinite(port)) throw new Error('DB_PORT inválida')
  if (!password) throw new Error('DB_PASSWORD ausente')

  return { host, port, database, user, password }
}

const main = async () => {
  const db = getDbConfig()
  const client = new Client({
    ...db,
    // Supabase Postgres requires SSL.
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  try {
    console.log('\n=== CONEXÃO COM O BANCO DE DADOS ===')
    console.log(`Host: ${db.host}:${db.port}`)
    console.log(`Database: ${db.database}`)
    console.log(`User: ${db.user}`)
    console.log(`Status: ✓ CONECTADO\n`)

    console.log('=== TABELAS DO BANCO DE DADOS ===')
    const tables = await client.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `)

    for (const row of tables.rows) {
      console.log(`\n📋 ${row.tablename}`)
      
      const count = await client.query(`
        SELECT COUNT(*) as count
        FROM ${row.schemaname}.${row.tablename};
      `)
      console.log(`   Registros: ${count.rows[0].count}`)
    }

    console.log('\n=== MIGRAÇÕES APLICADAS ===')
    const migrations = await client.query(`
      SELECT name, applied_at
      FROM public.schema_migrations
      ORDER BY name ASC;
    `)

    if (migrations.rows.length === 0) {
      console.log('   Nenhuma migração registrada')
    } else {
      for (const row of migrations.rows) {
        console.log(`   ✓ ${row.name} - ${row.applied_at}`)
      }
    }

    console.log('\n=== CONCLUSÃO ===')
    console.log('✓ Sistema está conectado e funcionando no banco de dados')
    console.log('✓ Acesso ao banco disponível via Node.js (biblioteca pg)')
    console.log('✗ CLI psql não está instalado no sistema\n')

  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('\n❌ Erro ao conectar ao banco de dados:')
  console.error(err)
  process.exitCode = 1
})
