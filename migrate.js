require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, testConnection, pool } = require('./db');

async function migrate() {
    console.log('Iniciando migracion...');

    const connected = await testConnection();
    if (!connected) {
        console.error('No se pudo conectar a Neon. Verifica DATABASE_URL.');
        process.exit(1);
    }

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    try {
        await query(schema);
        console.log('Schema aplicado correctamente');

        const tables = await query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' ORDER BY table_name
        `);
        console.log('Tablas creadas:', tables.rows.map(r => r.table_name).join(', '));
    } catch (error) {
        console.error('Error aplicando schema:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
