const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' }); // Adjusted for relative path in monorepo

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
    try {
        const res = await query('SELECT NOW()');
        console.log('✅ Base de Datos conectada con éxito:', res.rows[0].now);
        return true;
    } catch (err) {
        console.error('❌ Error conectando a Base de Datos:', err.message);
        return false;
    }
};

module.exports = {
    query,
    testConnection,
    pool
};
