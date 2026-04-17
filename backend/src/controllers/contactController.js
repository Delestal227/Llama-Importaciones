const db = require('../config/db');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');

const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;
    const { rows } = await db.query(
        `INSERT INTO contacts (name, email, phone, message)
         VALUES ($1,$2,$3,$4)
         RETURNING id, name, email, phone, status, created_at`,
        [name, email, phone, message]
    );
    res.status(201).json({ success: true, contact: rows[0] });
});

const listContacts = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
        params.push(status);
        where = `WHERE status = $${params.length}`;
    }
    const { rows } = await db.query(
        `SELECT id, name, email, phone, message, status, created_at
         FROM contacts ${where} ORDER BY created_at DESC LIMIT 200`,
        params
    );
    res.json({ success: true, contacts: rows });
});

const updateContactStatus = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        `UPDATE contacts SET status = $1 WHERE id = $2
         RETURNING id, status`,
        [req.body.status, req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, 'Contacto no encontrado');
    res.json({ success: true, contact: rows[0] });
});

module.exports = { createContact, listContacts, updateContactStatus };
