const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const getCart = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        'SELECT items, updated_at FROM carts WHERE user_email = $1',
        [req.user.email]
    );
    res.json({ success: true, cart: rows[0] || { items: [], updated_at: null } });
});

const upsertCart = asyncHandler(async (req, res) => {
    const { items } = req.body;
    const { rows } = await db.query(
        `INSERT INTO carts (user_email, items, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_email) DO UPDATE
           SET items = EXCLUDED.items, updated_at = NOW()
         RETURNING items, updated_at`,
        [req.user.email, JSON.stringify(items)]
    );
    res.json({ success: true, cart: rows[0] });
});

const clearCart = asyncHandler(async (req, res) => {
    await db.query('DELETE FROM carts WHERE user_email = $1', [req.user.email]);
    res.json({ success: true });
});

module.exports = { getCart, upsertCart, clearCart };
