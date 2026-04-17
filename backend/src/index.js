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

// Debug: Verify frontend dist path
const frontendPath = path.resolve(__dirname, '../../frontend/dist');
try {
    const fs = require('fs');
    if (fs.existsSync(frontendPath)) {
        logger.info({ files: fs.readdirSync(frontendPath) }, 'Frontend dist found');
    } else {
        logger.error({ frontendPath }, 'Frontend dist NOT FOUND');
    }
} catch (e) {
    logger.error({ err: e.message }, 'Error checking frontend path');
}

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

// Serve static files BEFORE CSP/Helmet/RateLimit to avoid blocking assets
app.use(express.static(frontendPath));

app.use(helmet({
    contentSecurityPolicy: false, // Temporarily disable to debug blank page
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

// Serve the React app for any other GET requests (SPA routing)
app.get('*', (req, res) => {
    // Check if it's an API request first
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const indexPath = path.join(frontendPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            logger.error({ err, indexPath }, 'Failed to serve index.html');
            res.status(500).send(`UI Error: The application was unable to load its interface (Code: ${err.code})`);
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
