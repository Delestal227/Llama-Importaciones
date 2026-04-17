require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL no configurada');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.error('Error inesperado en pool de PostgreSQL:', err);
});

async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.log('Query lenta:', { text, duration, rows: res.rowCount });
        }
        return res;
    } catch (error) {
        console.error('Error en query:', error.message);
        throw error;
    }
}

async function getClient() {
    return await pool.connect();
}

async function testConnection() {
    try {
        const res = await query('SELECT NOW() as now');
        console.log('Conectado a Neon:', res.rows[0].now);
        return true;
    } catch (error) {
        console.error('Error conectando a Neon:', error.message);
        return false;
    }
}

module.exports = { query, getClient, pool, testConnection };
