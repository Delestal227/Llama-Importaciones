const db = require('../config/db');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');

const listUsers = asyncHandler(async (_req, res) => {
    const { rows } = await db.query(
        `SELECT id, email, name, picture, role, phone, created_at
         FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, users: rows });
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
        throw new HttpError(400, 'Rol inv\u00e1lido');
    }
    const { rows } = await db.query(
        `UPDATE users SET role = $1, updated_at = NOW()
         WHERE id = $2 RETURNING id, email, role`,
        [role, req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, 'Usuario no encontrado');
    res.json({ success: true, user: rows[0] });
});

module.exports = { listUsers, updateUserRole };
