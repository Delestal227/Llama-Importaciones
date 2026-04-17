require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { query, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://accounts.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://accounts.google.com"],
            frameSrc: ["https://accounts.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Demasiadas solicitudes, por favor intenta mas tarde.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', async (req, res) => {
    try {
        const result = await query('SELECT NOW() as now');
        res.json({ status: 'ok', db: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/products', async (req, res) => {
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

        const result = await query(sql, params);
        res.json({ success: true, products: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { sku, name, description, price, stock, category, images, videos, active } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Campos requeridos: name, price' });
        }
        const result = await query(
            `INSERT INTO products (sku, name, description, price, stock, category, images, videos, active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [sku, name, description, price, stock || 0, category, JSON.stringify(images || []), JSON.stringify(videos || []), active !== false]
        );
        res.status(201).json({ success: true, product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { sku, name, description, price, stock, category, images, videos, active } = req.body;
        const result = await query(
            `UPDATE products SET
                sku = COALESCE($1, sku),
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                price = COALESCE($4, price),
                stock = COALESCE($5, stock),
                category = COALESCE($6, category),
                images = COALESCE($7, images),
                videos = COALESCE($8, videos),
                active = COALESCE($9, active),
                updated_at = NOW()
             WHERE id = $10 RETURNING *`,
            [sku, name, description, price, stock, category,
             images ? JSON.stringify(images) : null,
             videos ? JSON.stringify(videos) : null,
             active, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { email, name, picture, google_id, phone } = req.body;
        if (!email) return res.status(400).json({ error: 'email requerido' });

        const result = await query(
            `INSERT INTO users (email, name, picture, google_id, phone)
             VALUES ($1,$2,$3,$4,$5)
             ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                picture = EXCLUDED.picture,
                google_id = EXCLUDED.google_id,
                phone = COALESCE(EXCLUDED.phone, users.phone),
                updated_at = NOW()
             RETURNING *`,
            [email, name, picture, google_id, phone]
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:email', async (req, res) => {
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [req.params.email]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/cart/:email', async (req, res) => {
    try {
        const result = await query('SELECT items FROM carts WHERE user_email = $1', [req.params.email]);
        res.json({ success: true, items: result.rows[0]?.items || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cart/:email', async (req, res) => {
    try {
        const { items } = req.body;
        const result = await query(
            `INSERT INTO carts (user_email, items, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_email) DO UPDATE SET
                items = EXCLUDED.items,
                updated_at = NOW()
             RETURNING *`,
            [req.params.email, JSON.stringify(items || [])]
        );
        res.json({ success: true, cart: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cart/:email', async (req, res) => {
    try {
        await query('DELETE FROM carts WHERE user_email = $1', [req.params.email]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const client = await require('./db').getClient();
    try {
        await client.query('BEGIN');
        const { user_email, customer_name, customer_phone, delivery_type, delivery_address, payment_method, items, notes } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'items es requerido' });
        }

        const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.unit_price) * parseInt(it.quantity)), 0);
        const total = subtotal;

        const orderRes = await client.query(
            `INSERT INTO orders (user_email, customer_name, customer_phone, delivery_type, delivery_address, payment_method, subtotal, total, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [user_email, customer_name, customer_phone, delivery_type, delivery_address, payment_method, subtotal, total, notes]
        );
        const order = orderRes.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [order.id, item.product_id, item.product_name, item.quantity, item.unit_price,
                 parseFloat(item.unit_price) * parseInt(item.quantity)]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, order });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const { email, status } = req.query;
        let sql = `SELECT o.*, COALESCE(
            json_agg(json_build_object(
                'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
                'quantity', oi.quantity, 'unit_price', oi.unit_price, 'subtotal', oi.subtotal
            )) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE 1=1`;
        const params = [];

        if (email) {
            params.push(email);
            sql += ` AND o.user_email = $${params.length}`;
        }
        if (status) {
            params.push(status);
            sql += ` AND o.status = $${params.length}`;
        }
        sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

        const result = await query(sql, params);
        res.json({ success: true, orders: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (order.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });

        const items = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        res.json({ success: true, order: { ...order.rows[0], items: items.rows } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'status requerido' });

        const result = await query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, order: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Campos requeridos: name, email, message' });
        }
        const result = await query(
            `INSERT INTO contacts (name, email, phone, message)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [name, email, phone, message]
        );
        res.status(201).json({ success: true, contact: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/contacts', async (req, res) => {
    try {
        const { status } = req.query;
        let sql = 'SELECT * FROM contacts WHERE 1=1';
        const params = [];
        if (status) {
            params.push(status);
            sql += ` AND status = $${params.length}`;
        }
        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);
        res.json({ success: true, contacts: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use(express.static(path.join(__dirname, '.')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`Servidor en puerto ${PORT}`);
    if (process.env.DATABASE_URL) {
        await testConnection();
    }
});
