const { pool } = require('../config/db');
const db = require('../config/db');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { recordInventoryMovement } = require('../services/audit');

const createOrder = asyncHandler(async (req, res) => {
    const { customer_name, customer_phone, delivery_type, delivery_address,
            payment_method, notes, items } = req.body;
    const userEmail = req.user?.email || null;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ids = items.map(i => i.product_id);
        const { rows: products } = await client.query(
            `SELECT id, name, price, stock FROM products
             WHERE id = ANY($1::int[]) AND deleted_at IS NULL AND active = TRUE
             FOR UPDATE`,
            [ids]
        );
        if (products.length !== ids.length) {
            throw new HttpError(400, 'Alg\u00fan producto no existe o est\u00e1 inactivo');
        }

        const byId = new Map(products.map(p => [p.id, p]));
        let subtotal = 0;
        for (const item of items) {
            const p = byId.get(item.product_id);
            if (p.stock < item.quantity) {
                throw new HttpError(409, `Stock insuficiente para ${p.name}`);
            }
            subtotal += Number(p.price) * item.quantity;
        }

        const { rows: orderRows } = await client.query(
            `INSERT INTO orders (user_email, customer_name, customer_phone, delivery_type,
                delivery_address, payment_method, subtotal, total, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$7,$8)
             RETURNING id, user_email, customer_name, customer_phone, delivery_type,
                       delivery_address, payment_method, subtotal, total, status, notes, created_at`,
            [userEmail, customer_name, customer_phone, delivery_type,
             delivery_address, payment_method, subtotal, notes]
        );
        const order = orderRows[0];

        for (const item of items) {
            const p = byId.get(item.product_id);
            const lineSubtotal = Number(p.price) * item.quantity;
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [order.id, p.id, p.name, item.quantity, p.price, lineSubtotal]
            );
            const stockAfter = p.stock - item.quantity;
            await client.query('UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2',
                [stockAfter, p.id]);
            await recordInventoryMovement(client, {
                productId: p.id,
                movementType: 'sale',
                quantity: -item.quantity,
                stockBefore: p.stock,
                stockAfter,
                referenceId: order.id,
                referenceType: 'order',
                createdBy: userEmail,
            });
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, order });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

const listOrders = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const params = [];
    const where = [];
    if (status) {
        params.push(status);
        where.push(`status = $${params.length}`);
    }
    if (req.user?.role !== 'admin') {
        params.push(req.user.email);
        where.push(`user_email = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const { rows } = await db.query(
        `SELECT id, user_email, customer_name, customer_phone, delivery_type,
                delivery_address, payment_method, subtotal, total, status, notes, created_at
         FROM orders ${whereSql}
         ORDER BY created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
    );
    res.json({ success: true, orders: rows });
});

const getOrder = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        `SELECT id, user_email, customer_name, customer_phone, delivery_type,
                delivery_address, payment_method, subtotal, total, status, notes, created_at
         FROM orders WHERE id = $1`,
        [req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, 'Pedido no encontrado');
    const order = rows[0];
    if (req.user?.role !== 'admin' && order.user_email !== req.user?.email) {
        throw new HttpError(403, 'Sin acceso a este pedido');
    }
    const items = await db.query(
        `SELECT id, product_id, product_name, quantity, unit_price, subtotal
         FROM order_items WHERE order_id = $1`,
        [order.id]
    );
    res.json({ success: true, order: { ...order, items: items.rows } });
});

const updateStatus = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        `UPDATE orders SET status = $1 WHERE id = $2
         RETURNING id, status`,
        [req.body.status, req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, 'Pedido no encontrado');
    res.json({ success: true, order: rows[0] });
});

module.exports = { createOrder, listOrders, getOrder, updateStatus };
