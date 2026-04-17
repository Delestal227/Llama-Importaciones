require('dotenv').config({ path: '../.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());

const path = require('path');

// ... (existing middleware)

// Serve Backend API routes
app.use('/api/products', productRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// --- Unified Deployment Logic ---
// Serving static files from the frontend build directory
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all route to serve the React app for any non-API request
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    await testConnection();
});
