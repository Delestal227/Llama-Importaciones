const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 90, useClones: false });

const cacheMiddleware = (ttl = 60) => (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = `${req.originalUrl}`;
    const hit = cache.get(key);
    if (hit) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(hit);
    }
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache.set(key, body, ttl);
        }
        return originalJson(body);
    };
    next();
};

const invalidate = (prefix) => {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.del(key);
    }
};

module.exports = { cache, cacheMiddleware, invalidate };
