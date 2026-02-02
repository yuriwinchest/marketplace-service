
import { pool } from './backend/src/shared/database/connection.js';

async function checkCategories() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM public.categories');
        console.log('Categories count:', res.rows[0].count);

        if (res.rows[0].count === '0') {
            console.log('Categories table is empty!');
        } else {
            const sample = await pool.query('SELECT name FROM public.categories LIMIT 5');
            console.log('Sample categories:', sample.rows.map(r => r.name));
        }
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
}

checkCategories();
