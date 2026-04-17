const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');
const env = require('../config/env');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { signToken } = require('../middleware/auth');

const oauthClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const resolveRole = (email) =>
    env.ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'customer';

const googleLogin = asyncHandler(async (req, res) => {
    if (!oauthClient) throw new HttpError(503, 'Google Sign-In no configurado');
    const { credential } = req.body;

    const ticket = await oauthClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new HttpError(401, 'Credencial inv\u00e1lida');

    const email = payload.email.toLowerCase();
    const role = resolveRole(email);

    const { rows } = await db.query(
        `INSERT INTO users (email, name, picture, google_id, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name,
               picture = EXCLUDED.picture,
               google_id = EXCLUDED.google_id,
               role = CASE WHEN users.role = 'admin' THEN users.role ELSE EXCLUDED.role END,
               updated_at = NOW()
         RETURNING id, email, name, picture, role`,
        [email, payload.name, payload.picture, payload.sub, role]
    );
    const user = rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ success: true, token, user });
});

const me = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        'SELECT id, email, name, picture, role, phone FROM users WHERE id = $1',
        [req.user.id]
    );
    if (rows.length === 0) throw new HttpError(404, 'Usuario no encontrado');
    res.json({ success: true, user: rows[0] });
});

module.exports = { googleLogin, me };
