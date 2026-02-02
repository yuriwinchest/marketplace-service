
import { pool } from './backend/src/shared/database/connection.js';

const categories = [
    // Tecnologia e Design
    'Desenvolvedor Web', 'Desenvolvedor Mobile', 'Criação de Sites', 'Designer Gráfico', 'UI/UX Designer',
    'Editor de Vídeo', 'Marketing Digital', 'Gestor de Tráfego', 'Social Media', 'Técnico de Celular',
    'Instalação de Redes', 'Segurança Eletrônica', 'Automação Residencial', 'Recuperação de Dados', 'SEO',

    // Reformas e Construção
    'Marceneiro', 'Serralheiro', 'Vidraceiro', 'Gesseiro', 'Piscineiro', 'Paisagista', 'Dedetizador',
    'Desentupidor', 'Marido de Aluguel', 'Tapeceiro', 'Decorador', 'Arquiteto', 'Engenheiro Civil',
    'Mestre de Obras', 'Telhadista', 'Calheiro', 'Impermeabilizador', 'Azulejista', 'Instalador de Piso',

    // Serviços Domésticos
    'Empregada Doméstica', 'Babá', 'Cozinheira', 'Motorista Particular', 'Cuidador de Idosos',
    'Passadeira', 'Lavadeira', 'Organizador Pessoal', 'Limpeza de Estofados', 'Limpeza Pós-Obra',

    // Pets
    'Passeador de Cães', 'Adestrador', 'Banho e Tosa', 'Veterinário em Domicílio', 'Hospedagem Pet',

    // Aulas e Ensino
    'Professor de Inglês', 'Professor de Espanhol', 'Professor de Matemática', 'Professor de Português',
    'Professor de Música', 'Professor de Piano', 'Professor de Violão', 'Reforço Escolar', 'Aulas de Informática',

    // Saúde e Bem-estar
    'Personal Trainer', 'Instrutor de Yoga', 'Professor de Dança', 'Psicólogo', 'Nutricionista',
    'Fisioterapeuta', 'Fonoaudiólogo', 'Enfermeira', 'Massagista', 'Terapeuta Holístico',

    // Beleza e Estética
    'Cabeleireira', 'Manicure e Pedicure', 'Maquiadora', 'Esteticista', 'Barbeiro', 'Depiladora',
    'Designer de Sobrancelhas', 'Micropigmentadora', 'Podóloga',

    // Eventos
    'Fotógrafo', 'Filmagem de Eventos', 'Buffet', 'DJ', 'Banda para Festas', 'Barman',
    'Cerimonialista', 'Decorador de Festas', 'Confeiteira', 'Bolo e Doces', 'Salgados para Festas',
    'Aluguel de Brinquedos', 'Garçom', 'Segurança de Eventos',

    // Veículos
    'Mecânico Automotivo', 'Funilaria e Pintura', 'Eletricista de Autos', 'Lavagem Automotiva',
    'Martelinho de Ouro', 'Instalação de Som Automotivo', 'Mecânico de Motos', 'Guincho',

    // Consultoria e Serviços Gerais
    'Contador', 'Advogado', 'Tradutor', 'Redator', 'Consultor Financeiro', 'Detetive Particular',
    'Costureira', 'Sapateiro', 'Chaveiro 24h', 'Entregador', 'Motoboy', 'Mudanças e Carretos'
];

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Separa acentos das letras
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, '-') // Substitui espaços por hifens
        .replace(/[^\w\-]+/g, '') // Remove caracteres não alfanuméricos
        .replace(/\-\-+/g, '-') // Remove hifens duplicados
        .trim();
}

async function populate() {
    try {
        console.log('Ensure unique constraint on name...');
        try {
            await pool.query('ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name)');
        } catch (e) { } // ignore if exists

        console.log(`Inserting ${categories.length} categories...`);

        for (const name of categories) {
            const slug = slugify(name);
            try {
                await pool.query(
                    `INSERT INTO public.categories (name, slug) VALUES ($1, $2) 
           ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug`, // Update slug just in case
                    [name, slug]
                );
            } catch (err: any) {
                console.error(`Failed to insert ${name}:`, err.message);
            }
        }

        const count = await pool.query('SELECT COUNT(*) FROM public.categories');
        console.log('Final categories count:', count.rows[0].count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

populate();
