const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["https://accounts.google.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// CORS - Solo desde el mismo origen
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes, por favor intenta más tarde.'
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// API Routes placeholder
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Campos requeridos: name, email, message' });
  }
  // TODO: Procesar contacto (guardar en BD, enviar email, etc.)
  res.json({ success: true, message: 'Contacto recibido' });
});

// Placeholder para transacciones (futuro)
app.post('/api/transactions', (req, res) => {
  res.status(501).json({ error: 'Endpoint no implementado aún' });
});

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Accede a https://llama-importaciones.onrender.com`);
});
