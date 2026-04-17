const { query, pool } = require('../backend/src/config/db');

async function debug() {
    try {
        console.log('--- Buscando productos con imágenes sospechosas ---');
        // Buscamos productos que tengan imágenes que contengan "off" o banners (esto es una suposición, vamos a ver qué sale)
        // También buscamos los nombres específicos del screenshot
        const sql = `
            SELECT id, name, description, images, category 
            FROM products 
            WHERE (name ILIKE '%Auricular Bluetooth DIN%' 
               OR name ILIKE '%Auricular Bluetooth YX36%')
               OR (description IS NOT NULL AND description != '')
            LIMIT 10
        `;
        const res = await query(sql);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

debug();
