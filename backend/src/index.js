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

// Comprehensive path resolution for frontend static files
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
logger.info({ frontendPath }, 'Static files distribution path');

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

// Serve static files with priority
app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
}));

const allowedOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(',').map(s => s.trim())
    : [];
app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.isDevelopment) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        cb(null, true); // Permissive for debug
    },
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

const readLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

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

// Debug Endpoint
app.get('/api/debug-paths', (req, res) => {
    const fs = require('fs');
    const exists = fs.existsSync(frontendPath);
    res.json({
        frontendPath,
        exists,
        cwd: process.cwd(),
        dirname: __dirname,
        files: exists ? fs.readdirSync(frontendPath) : []
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contacts', contactRoutes);

// Serve static files from the frontend/dist folder
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  // Never serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Serve index.html for everything else (React routing)
  res.sendFile(path.join(frontendPath, 'index.html'));
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
