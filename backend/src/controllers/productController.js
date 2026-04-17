const db = require('../config/db');
const { pool } = require('../config/db');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { invalidate } = require('../middleware/cache');
const { recordPriceChange, recordInventoryMovement } = require('../services/audit');

const PRODUCT_COLUMNS = `
    id, sku, name, description, price, stock, category,
    images, videos, active, created_at, updated_at
`;

const getProducts = asyncHandler(async (req, res) => {
    const { category, q, active, page, limit, sort, order } = req.query;
    const params = [];
    const where = ['deleted_at IS NULL'];

    if (category && category !== 'all') {
        params.push(category);
        where.push(`category = $${params.length}`);
    }
    if (q) {
        params.push(`%${q}%`);
        where.push(`(name ILIKE $${params.length} OR sku ILIKE $${params.length})`);
    }
    if (active === 'true') where.push('active = TRUE');
    else if (active === 'false') where.push('active = FALSE');

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const whereSql = where.join(' AND ');
    const sql = `
        SELECT ${PRODUCT_COLUMNS}
        FROM products
        WHERE ${whereSql}
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const countSql = `SELECT COUNT(*)::int AS total FROM products WHERE ${whereSql}`;

    const [rows, count] = await Promise.all([
        db.query(sql, params),
        db.query(countSql, params.slice(0, params.length - 2)),
    ]);

    res.json({
        success: true,
        products: rows.rows,
        pagination: {
            page, limit,
            total: count.rows[0].total,
            pages: Math.ceil(count.rows[0].total / limit),
        },
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1 AND deleted_at IS NULL`,
        [req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, 'Producto no encontrado');
    res.json({ success: true, product: rows[0] });
});

const createProduct = asyncHandler(async (req, res) => {
    const p = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO products (sku, name, description, price, stock, category, images, videos, active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${PRODUCT_COLUMNS}`,
            [p.sku, p.name, p.description, p.price, p.stock, p.category,
             JSON.stringify(p.images), JSON.stringify(p.videos), p.active]
        );
        const created = rows[0];
        if (p.stock > 0) {
            await recordInventoryMovement(client, {
                productId: created.id,
                movementType: 'initial',
                quantity: p.stock,
                stockBefore: 0,
                stockAfter: p.stock,
                createdBy: req.user?.email,
            });
        }
        await client.query('COMMIT');
        invalidate('/api/products');
        res.status(201).json({ success: true, product: created });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const existing = await client.query(
            `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
            [id]
        );
        if (existing.rows.length === 0) throw new HttpError(404, 'Producto no encontrado');
        const prev = existing.rows[0];

        const fields = [];
        const params = [];
        const mapped = {
            sku: updates.sku,
            name: updates.name,
            description: updates.description,
            price: updates.price,
            stock: updates.stock,
            category: updates.category,
            images: updates.images !== undefined ? JSON.stringify(updates.images) : undefined,
            videos: updates.videos !== undefined ? JSON.stringify(updates.videos) : undefined,
            active: updates.active,
        };
        for (const [k, v] of Object.entries(mapped)) {
            if (v === undefined) continue;
            params.push(v);
            fields.push(`${k} = $${params.length}`);
        }
        if (fields.length === 0) {
            await client.query('ROLLBACK');
            return res.json({ success: true, product: prev });
        }
        params.push(id);
        const { rows } = await client.query(
            `UPDATE products SET ${fields.join(', ')}, updated_at = NOW()
             WHERE id = $${params.length} RETURNING ${PRODUCT_COLUMNS}`,
            params
        );
        const next = rows[0];

        if (updates.price !== undefined && Number(updates.price) !== Number(prev.price)) {
            await recordPriceChange(client, {
                productId: id,
                oldPrice: prev.price,
                newPrice: updates.price,
                changedBy: req.user?.email,
            });
        }
        if (updates.stock !== undefined && Number(updates.stock) !== Number(prev.stock)) {
            const delta = Number(updates.stock) - Number(prev.stock);
            await recordInventoryMovement(client, {
                productId: id,
                movementType: delta > 0 ? 'restock' : 'adjustment',
                quantity: delta,
                stockBefore: prev.stock,
                stockAfter: updates.stock,
                createdBy: req.user?.email,
            });
        }
        await client.query('COMMIT');
        invalidate('/api/products');
        res.json({ success: true, product: next });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { rowCount } = await db.query(
        `UPDATE products SET deleted_at = NOW(), active = FALSE
         WHERE id = $1 AND deleted_at IS NULL`,
        [req.params.id]
    );
    if (rowCount === 0) throw new HttpError(404, 'Producto no encontrado');
    invalidate('/api/products');
    res.json({ success: true });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
