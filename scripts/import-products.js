const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { query, pool, testConnection } = require('../backend/src/config/db');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const JSON_PATH = args.find(a => a.endsWith('.json')) || path.join(__dirname, '..', 'products-to-import.json');
const FOLDER = process.env.CLOUDINARY_FOLDER || 'llama-importaciones/products';
const BATCH_DELAY_MS = 300;
const CONCURRENCY = 3;

const categoryMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'category-map.json'), 'utf8'));

function mapCategory(raw) {
    if (!raw) return categoryMap._default || 'varios';
    if (categoryMap[raw]) return categoryMap[raw];
    const lowered = raw.toLowerCase();
    for (const key of Object.keys(categoryMap)) {
        if (key.startsWith('_')) continue;
        if (key.toLowerCase() === lowered) return categoryMap[key];
    }
    return categoryMap._default || 'varios';
}

function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);
}

function cleanPrice(p) {
    if (p === null || p === undefined) return 0;
    const str = String(p).replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num);
}

async function uploadImage(imageUrl, productName) {
    if (!imageUrl || imageUrl.startsWith('data:')) return null;
    if (DRY_RUN) return `[DRY-RUN] ${imageUrl}`;

    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: FOLDER,
            public_id: slugify(productName) + '-' + Date.now(),
            resource_type: 'image',
            overwrite: false,
            timeout: 60000
        });
        return result.secure_url;
    } catch (error) {
        console.warn(`  ! Fallo upload imagen: ${error.message}`);
        return null;
    }
}

async function insertProduct(product, imageUrl) {
    const category = mapCategory(product._sourceCategory);
    const sku = product.sku || null;
    const name = product.name;
    const description = product.description || product.brand || '';
    const price = cleanPrice(product.salePrice || product.price || product.regularPrice);
    const stock = product.stock !== undefined ? parseInt(product.stock) : 0;
    const images = imageUrl ? [imageUrl] : [];
    const videos = [];
    const active = true;

    if (DRY_RUN) {
        console.log(`  [DRY-RUN] INSERT: ${name} | $${price} | ${category} | img:${images.length}`);
        return { dry: true };
    }

    try {
        const sqlQuery = sku
            ? `INSERT INTO products (sku, name, description, price, stock, category, images, videos, active)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               ON CONFLICT (sku) DO UPDATE SET
                  name = EXCLUDED.name,
                  description = EXCLUDED.description,
                  price = EXCLUDED.price,
                  stock = EXCLUDED.stock,
                  category = EXCLUDED.category,
                  images = EXCLUDED.images,
                  updated_at = NOW()
               RETURNING id, name`
            : `INSERT INTO products (sku, name, description, price, stock, category, images, videos, active)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, name`;

        const result = await query(sqlQuery, [
            sku, name, description, price, stock, category,
            JSON.stringify(images), JSON.stringify(videos), active
        ]);
        return result.rows[0];
    } catch (error) {
        console.error(`  X Error DB: ${error.message}`);
        return null;
    }
}

function extractProducts(data) {
    const list = [];

    if (Array.isArray(data)) {
        return data.map(p => ({ ...p, _sourceCategory: p.category || null }));
    }

    if (Array.isArray(data.allProducts)) {
        data.allProducts.forEach(p => {
            const cat = Array.isArray(p.categories) && p.categories.length > 0
                ? p.categories[0]
                : (p.category || null);
            list.push({ ...p, _sourceCategory: cat });
        });
        if (list.length > 0) return list;
    }

    if (data.categorias && typeof data.categorias === 'object') {
        for (const [categoryName, products] of Object.entries(data.categorias)) {
            if (!Array.isArray(products)) continue;
            products.forEach(p => {
                list.push({ ...p, _sourceCategory: categoryName });
            });
        }
        return list;
    }

    if (Array.isArray(data.products)) {
        return data.products.map(p => ({ ...p, _sourceCategory: p.category || null }));
    }

    throw new Error('Estructura JSON no reconocida. Esperado: array, {allProducts: []}, {categorias: {cat: []}}, o {products: []}');
}

function configureCloudinary() {
    if (!process.env.CLOUDINARY_URL && !DRY_RUN) {
        console.error('CLOUDINARY_URL no configurada. Configura .env o usa --dry-run');
        process.exit(1);
    }
    cloudinary.config({ secure: true });
}

async function processBatch(batch, startIdx, total) {
    const results = await Promise.allSettled(batch.map(async (product, i) => {
        const idx = startIdx + i + 1;
        console.log(`[${idx}/${total}] ${product.name}`);

        const imageUrl = await uploadImage(product.imageUrl, product.name);
        const dbResult = await insertProduct(product, imageUrl);

        return { product, imageUrl, dbResult };
    }));

    return results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
}

async function main() {
    console.log('=== IMPORTADOR DE PRODUCTOS ===');
    console.log('Modo:', DRY_RUN ? 'DRY-RUN (sin escribir)' : 'LIVE');
    console.log('Archivo:', JSON_PATH);
    console.log('Carpeta Cloudinary:', FOLDER);
    console.log('');

    if (!fs.existsSync(JSON_PATH)) {
        console.error(`Archivo no encontrado: ${JSON_PATH}`);
        console.error('Uso: npm run import -- ruta/al/archivo.json');
        process.exit(1);
    }

    configureCloudinary();

    if (!DRY_RUN) {
        const ok = await testConnection();
        if (!ok) process.exit(1);
    }

    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    const products = extractProducts(data);

    console.log(`Productos detectados: ${products.length}`);
    console.log('');

    const stats = { success: 0, withImage: 0, failed: 0 };
    const errors = [];

    for (let i = 0; i < products.length; i += CONCURRENCY) {
        const batch = products.slice(i, i + CONCURRENCY);
        const results = await processBatch(batch, i, products.length);

        results.forEach(r => {
            if (r.error) {
                stats.failed++;
                errors.push(r.error);
            } else if (r.dbResult) {
                stats.success++;
                if (r.imageUrl) stats.withImage++;
            } else {
                stats.failed++;
            }
        });

        if (i + CONCURRENCY < products.length) {
            await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
        }
    }

    console.log('');
    console.log('=== RESUMEN ===');
    console.log(`OK:         ${stats.success}`);
    console.log(`Con imagen: ${stats.withImage}`);
    console.log(`Fallidos:   ${stats.failed}`);

    if (errors.length > 0 && errors.length < 20) {
        console.log('\nErrores:');
        errors.forEach((e, i) => console.log(`  ${i+1}. ${e}`));
    }

    if (!DRY_RUN) await pool.end();
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
