const { query, pool } = require('../backend/src/config/db');

const CATEGORY_MAP = {
    'tecnologia': 'tecnologia-innovacion',
    'electronica': 'audio-sonido-premium',
    'hogar': 'hogar-diseno',
    'cuidado': 'belleza-bienestar',
    'bazar': 'bazar-cocina-gourmet',
    'varios': 'equipamiento-esencial'
};

const IMAGE_FIXES = [
    {
        pattern: '%AURIFLY PRO 17%',
        newImage: 'https://acdn-us.mitiendanube.com/stores/001/131/056/products/auricular-bluetooth-dinax-aurifly-pro-17-1026e9789e7b2d9ada17504594530124-480-0.webp'
    },
    {
        pattern: '%Auricular Bluetooth YX36%',
        newImage: 'https://www.lacolon.com.ar/wp-content/uploads/2023/11/YX36-1.jpg'
    },
    {
        pattern: '%PERSONAJES Ark-T28c%',
        newImage: 'https://acdn-us.mitiendanube.com/stores/001/131/056/products/auriculares-bluetooth-pro-animales-stitch-pikachu-oso-perro-429930be3472f8836517208076067757-480-0.webp'
    }
];

async function run() {
    try {
        console.log('--- Iniciando Reclasificación Masiva ---');
        
        // 1. Reclasificar Categorías
        for (const [oldCat, newCat] of Object.entries(CATEGORY_MAP)) {
            const res = await query(
                'UPDATE products SET category = $1 WHERE category = $2',
                [newCat, oldCat]
            );
            console.log(`Actualizada categoría: ${oldCat} -> ${newCat} (${res.rowCount} productos)`);
        }

        // 2. Corregir Imágenes
        console.log('\n--- Corrigiendo Imágenes Específicas ---');
        for (const fix of IMAGE_FIXES) {
            const res = await query(
                'UPDATE products SET images = $1 WHERE name ILIKE $2',
                [JSON.stringify([fix.newImage]), fix.pattern]
            );
            if (res.rowCount > 0) {
                console.log(`✅ Corregida imagen para: ${fix.pattern} (${res.rowCount} fila/s)`);
            } else {
                console.log(`⚠️ No se encontró producto para: ${fix.pattern}`);
            }
        }

        console.log('\n--- Proceso completado con éxito ---');
    } catch (err) {
        console.error('Error fatal:', err.message);
    } finally {
        await pool.end();
    }
}

run();
