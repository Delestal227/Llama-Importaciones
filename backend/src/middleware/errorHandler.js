const { ZodError } = require('zod');
const logger = require('../config/logger');
const env = require('../config/env');

class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

const notFound = (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
};

const errorHandler = (err, req, res, _next) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Datos inv\u00e1lidos',
            issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
        });
    }

    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, details: err.details });
    }

    if (err.code === '23505') {
        return res.status(409).json({ error: 'Recurso duplicado' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Referencia inv\u00e1lida' });
    }
    if (err.code === '22P02') {
        return res.status(400).json({ error: 'Formato inv\u00e1lido' });
    }

    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');
    res.status(500).json({
        error: 'Error interno',
        ...(env.isDevelopment ? { message: err.message } : {}),
    });
};

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { HttpError, notFound, errorHandler, asyncHandler };
