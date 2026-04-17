const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (payload) =>
    jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

const extractToken = (req) => {
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    return token;
};

const requireAuth = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    try {
        req.user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ error: 'Token inv\u00e1lido o expirado' });
    }
};

const requireAdmin = (req, res, next) => {
    requireAuth(req, res, (err) => {
        if (err) return next(err);
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Se requiere rol admin' });
        }
        next();
    });
};

const optionalAuth = (req, _res, next) => {
    const token = extractToken(req);
    if (token) {
        try { req.user = verifyToken(token); } catch { /* ignore */ }
    }
    next();
};

module.exports = { signToken, verifyToken, requireAuth, requireAdmin, optionalAuth };
