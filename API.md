# API Documentation - LLAMA IMPORTACIONES

## Base URL
```
https://llama-importaciones.onrender.com
```

## Endpoints Disponibles

### 1. Contact Form
**POST** `/api/contact`

Envía un mensaje de contacto.

**Request:**
```json
{
  "name": "Juan",
  "email": "juan@example.com",
  "message": "Hola, quiero más información..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Contacto recibido"
}
```

**Response (Error - 400):**
```json
{
  "error": "Campos requeridos: name, email, message"
}
```

---

### 2. Transactions (Placeholder)
**POST** `/api/transactions`

Endpoint para futuras integraciones de transacciones/pagos.

**Status Actual:** 501 Not Implemented

---

## Seguridad

### Headers Aplicados
✅ **Content-Security-Policy** - Previene XSS  
✅ **X-Frame-Options** - Previene clickjacking  
✅ **Strict-Transport-Security** - Fuerza HTTPS  
✅ **X-Content-Type-Options** - Previene MIME sniffing  
✅ **Referrer-Policy** - Controla información de referencia  
✅ **Permissions-Policy** - Restricción de permisos del navegador  

### Rate Limiting
- **Límite:** 100 peticiones por 15 minutos
- **Mensaje:** "Demasiadas solicitudes, por favor intenta más tarde."

### CORS
- Aceptar requests desde el mismo origen
- Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS

---

## Cómo Agregar Nuevos Endpoints

Abre `server.js` y agrega después de la línea de `app.use(express.urlencoded(...))`:

```javascript
// Nuevo endpoint
app.post('/api/mi-endpoint', (req, res) => {
  const { campo1, campo2 } = req.body;
  
  // Validar
  if (!campo1 || !campo2) {
    return res.status(400).json({ error: 'Campos requeridos' });
  }
  
  // Procesar lógica
  try {
    // TODO: Tu lógica aquí
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Próximas Mejoras

- [ ] Integración con base de datos (MongoDB, PostgreSQL)
- [ ] Autenticación (JWT)
- [ ] Sistema de transacciones/pagos (Stripe, etc.)
- [ ] Validación avanzada con `express-validator`
- [ ] Logging y monitoreo
- [ ] Tests unitarios

---

**Última actualización:** 2026-04-17
