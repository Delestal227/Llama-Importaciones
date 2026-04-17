const pino = require('pino');
const env = require('./env');

let transport;
if (!env.isProduction) {
    try {
        require.resolve('pino-pretty');
        transport = { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } };
    } catch { /* pino-pretty not installed, fall back to JSON */ }
}

const logger = pino({
    level: env.isProduction ? 'info' : 'debug',
    transport,
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
        remove: true,
    },
});

module.exports = logger;
