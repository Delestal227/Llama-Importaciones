const { Pool } = require('pg');
const env = require('./env');
const logger = require('./logger');

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.isProduction || env.DATABASE_URL.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected error on idle pg client');
});

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
    try {
        const res = await query('SELECT NOW()');
        logger.info({ now: res.rows[0].now }, 'Database connected');
        return true;
    } catch (err) {
        logger.error({ err: err.message }, 'Database connection failed');
        return false;
    }
};

const closePool = () => pool.end();

module.exports = { query, testConnection, closePool, pool };
