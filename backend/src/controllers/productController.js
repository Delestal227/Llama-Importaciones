const db = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const { category, active } = req.query;
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            params.push(category);
            sql += ` AND category = $${params.length}`;
        }
        if (active !== 'false') {
            sql += ' AND active = TRUE';
        }
        sql += ' ORDER BY created_at DESC';

        const result = await db.query(sql, params);
        res.json({ success: true, products: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { sku, name, description, price, stock, category, images, videos, active } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Campos requeridos: name, price' });
        }
        const result = await db.query(
            `INSERT INTO products (sku, name, description, price, stock, category, images, videos, active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [sku, name, description, price, stock || 0, category, JSON.stringify(images || []), JSON.stringify(videos || []), active !== false]
        );
        res.status(201).json({ success: true, product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct
};
