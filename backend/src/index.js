const env = require('./config/env');
const logger = require('./config/logger');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');

const { testConnection, closePool, query } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
app.set('trust proxy', 1);

app.use(pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
}));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://accounts.google.com', 'https://apis.google.com'],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.cloudinary.com',
                     'https://i.pravatar.cc', 'https://images.unsplash.com',
                     'https://lh3.googleusercontent.com'],
            connectSrc: ["'self'", 'https://accounts.google.com'],
            mediaSrc: ["'self'", 'https://res.cloudinary.com', 'https://*.cloudinary.com'],
            frameSrc: ['https://accounts.google.com'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(',').map(s => s.trim())
    : [];
app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.isDevelopment) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('CORS blocked'));
    },
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return readLimiter(req, res, next);
    return writeLimiter(req, res, next);
});

app.get('/api/health', async (_req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() });
    } catch {
        res.status(503).json({ status: 'degraded', db: 'down', timestamp: new Date().toISOString() });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contacts', contactRoutes);

app.use('/api', notFound);

const frontendPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
logger.info({ frontendPath }, 'Serving static files');

app.use(express.static(frontendPath, { maxAge: '1d' }));

app.get('*', (req, res) => {
    // If it's an API route that reached here, return 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // Otherwise serve the React app
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error loading frontend. Path: ' + frontendPath);
        }
    });
});

app.use(errorHandler);

const server = app.listen(env.PORT, async () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API listening');
    await testConnection();
});

const shutdown = (signal) => {
    logger.info({ signal }, 'Shutdown requested');
    server.close(async () => {
        await closePool();
        logger.info('Clean shutdown');
        process.exit(0);
    });
    setTimeout(() => {
        logger.warn('Forced shutdown after 10s');
        process.exit(1);
    }, 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
