
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
    if (!password) throw new Error('DB_PASSWORD ausente')

    return { host, port, database, user, password }
}

const main = async () => {
    const db = getDbConfig()
    const client = new Client(db)

    await client.connect()

    try {
        console.log('\n=== AUDITORIA DE BANCO DE DADOS ===')

        // 1. Check Tables and PKs
        console.log('\n1. Verificando Tabelas e Primary Keys (UUID)...')
        const pkResult = await client.query(`
      SELECT tc.table_name, kcu.column_name, c.data_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.columns c 
        ON kcu.table_name = c.table_name AND kcu.column_name = c.column_name
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    `)

        const validPks: Record<string, boolean> = {}
        pkResult.rows.forEach(row => {
            const isUuid = row.data_type === 'uuid'
            console.log(`Table: ${row.table_name}, PK: ${row.column_name} (${row.data_type}) - ${isUuid ? 'OK' : 'FAIL'}`)
            if (isUuid) validPks[row.table_name] = true
        })

        // 2. Check RLS
        console.log('\n2. Verificando RLS (Row Level Security)...')
        const rlsResult = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relkind = 'r' 
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `)
        rlsResult.rows.forEach(row => {
            console.log(`Table: ${row.relname}, RLS Enabled: ${row.relrowsecurity} - ${row.relrowsecurity ? 'OK' : 'FAIL'}`)
        })

        // 3. Check for Audit Columns (created_at, updated_at, deleted_at)
        console.log('\n3. Verificando Colunas de Auditoria...')
        const columnsResult = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name IN ('created_at', 'updated_at', 'deleted_at')
    `)

        const tableColumns: Record<string, Set<string>> = {}
        columnsResult.rows.forEach(row => {
            if (!tableColumns[row.table_name]) tableColumns[row.table_name] = new Set()
            tableColumns[row.table_name]!.add(row.column_name)
        })

        for (const table of rlsResult.rows.map(r => r.relname)) {
            const cols = tableColumns[table] || new Set()
            const hasCreated = cols.has('created_at')
            const hasUpdated = cols.has('updated_at')
            const hasDeleted = cols.has('deleted_at')
            console.log(`Table: ${table} [created_at: ${hasCreated ? '✓' : '✗'}, updated_at: ${hasUpdated ? '✓' : '✗'}, deleted_at: ${hasDeleted ? '✓' : '✗'}]`)
        }

        // 4. Check for Foreign Keys and Indexes
        console.log('\n4. Verificando Índices em Foreign Keys...')
        // Get all FKs
        const fksResult = await client.query(`
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `)

        // Get all Indexes
        const indexesResult = await client.query(`
        SELECT
            t.relname AS table_name,
            i.relname AS index_name,
            a.attname AS column_name
        FROM
            pg_class t,
            pg_class i,
            pg_index ix,
            pg_attribute a
        WHERE
            t.oid = ix.indrelid
            AND i.oid = ix.indexrelid
            AND a.attrelid = t.oid
            AND a.attnum = ANY(ix.indkey)
            AND t.relkind = 'r'
            AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `)

        const indexes = new Set<string>()
        indexesResult.rows.forEach(row => {
            indexes.add(`${row.table_name}.${row.column_name}`)
        })

        fksResult.rows.forEach(row => {
            const key = `${row.table_name}.${row.column_name}`
            const hasIndex = indexes.has(key)
            console.log(`FK: ${key} -> ${row.foreign_table_name}.${row.foreign_column_name} | Indexed: ${hasIndex ? 'OK' : 'FAIL'}`)
        })


        // 5. Check Row Counts (Data Persistence Sanity Check)
        console.log('\n5. Verificando Contagem de Registros (Persistência)...')
        const tablesList = rlsResult.rows.map(r => r.relname)
        for (const table of tablesList) {
            const countResult = await client.query(`SELECT COUNT(*) as count FROM public.${table}`)
            console.log(`Table: ${table} - Rows: ${countResult.rows[0].count}`)
        }

    } catch (err) {
        console.error(err)
    } finally {
        await client.end()
    }
}

main()
