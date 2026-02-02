
import { pool } from './backend/src/shared/database/connection.js';
import fs from 'fs';
import path from 'path';

async function fixAndPopulate() {
    try {
        console.log('Checking for unique constraint on categories(name)...');

        // Tenta adicionar a constraint. Como a tabela está vazia, é seguro.
        try {
            await pool.query('ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name)');
            console.log('Constraint added successfully.');
        } catch (e: any) {
            // Se erro for duplicação da constraint, ok. Se for outra coisa, logamos.
            // Mas se o erro anterior foi "no unique constraint", então ela não existe.
            console.log('Note on constraint creation:', e.message);
        }

        const migrationPath = path.join(process.cwd(), 'backend', 'migrations', '005_populate_categories.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log('Executing population script...');
        await pool.query(sql);
        console.log('Population executed successfully!');

        const count = await pool.query('SELECT COUNT(*) FROM public.categories');
        console.log('Final categories count:', count.rows[0].count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

fixAndPopulate();
