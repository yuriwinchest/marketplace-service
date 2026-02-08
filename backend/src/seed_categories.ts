import { pool } from './shared/database/connection.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CATEGORIES = [
    { name: 'Reformas e Reparos', icon: '🔨' },
    { name: 'Assistência Técnica', icon: '🔧' },
    { name: 'Aulas', icon: '📚' },
    { name: 'Autos', icon: '🚗' },
    { name: 'Consultoria', icon: '💼' },
    { name: 'Design e Tecnologia', icon: '💻' },
    { name: 'Eventos', icon: '🎉' },
    { name: 'Moda e Beleza', icon: '💄' },
    { name: 'Saúde', icon: '🏥' },
    { name: 'Serviços Domésticos', icon: '🧹' }
];

async function seed() {
    console.log("Iniciando Seed de Categorias...");
    try {
        const check = await pool.query('SELECT count(*) FROM categories');
        const count = parseInt(check.rows[0].count);

        console.log(`Categorias existentes: ${count}`);

        if (count === 0) {
            console.log("Inserindo categorias padrão...");
            for (const cat of CATEGORIES) {
                await pool.query(
                    "INSERT INTO categories (name, icon) VALUES ($1, $2)",
                    [cat.name, cat.icon]
                );
            }
            console.log("Categorias inseridas com sucesso!");
        } else {
            console.log("Tabela já contém dados. Pulando inserção.");
        }
    } catch (error) {
        console.error("Erro no Seed:", error);
    } finally {
        await pool.end();
    }
}

seed();
