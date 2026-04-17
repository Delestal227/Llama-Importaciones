# Guía de Deployment - LLAMA IMPORTACIONES

## ¿Qué Cambió?

Tu aplicación ahora tiene:
1. **Servidor Express con seguridad** - Todos los headers HTTP
2. **Rate limiting** - Protección contra ataques
3. **CORS configurado** - Control de origen
4. **Estructura lista para APIs** - Endpoints de contacto y transacciones
5. **robots.txt y sitemap.xml** - SEO mejorado
6. **Documentación completa** - API.md y SECURITY.md

---

## En Render

### 1️⃣ Tu repositorio ya está conectado
Render detecta automáticamente cambios en GitHub/GitLab.

### 2️⃣ Variables de Entorno (Opcional)
Si necesitas variables en el futuro:
1. Ve a tu servicio en Render Dashboard
2. **Settings** → **Environment Variables**
3. Agrega las variables de `.env.example`

### 3️⃣ Deploy Automático
Cada vez que hagas `git push`:
- Render detecta cambios
- Ejecuta `npm install`
- Ejecuta `npm start`
- La aplicación reinicia

---

## Local (Para Desarrollo)

### Instalar dependencias
```bash
npm install
```

### Ejecutar localmente
```bash
npm start
```

Accede a `http://localhost:3000`

### Desarrollo con hot reload
```bash
npm run dev
```

---

## Comandos Útiles

### Ver logs en Render
```
Dashboard Render → Tu servicio → Logs
```

### Reiniciar servicio
```
Dashboard Render → Tu servicio → Manual Deploy
```

### Agregar puerto 8080 (si lo necesitas)
Render cierra automáticamente puertos no usados. Si necesitas el 8080:
1. Crea un nuevo servicio de "Background Worker"
2. Configuralo en Render

---

## Endpoints Disponibles Ahora

| Endpoint | Método | Propósito |
|----------|--------|----------|
| `/` | GET | Página principal |
| `/api/contact` | POST | Formulario de contacto |
| `/api/transactions` | POST | Placeholder para pagos |

---

## Próximas Mejoras (Roadmap)

### Fase 2: Base de Datos
- MongoDB o PostgreSQL
- Guardar contactos
- Guardar transacciones

### Fase 3: Autenticación
- JWT
- Login de usuarios
- Admin panel

### Fase 4: Pagos
- Stripe o MercadoPago
- Carrito de compras
- Órdenes

### Fase 5: Email
- Confirmar contacto por email
- Recibos de transacciones
- Notificaciones

---

## Health Check

Para verificar que el servidor está funcionando:
```bash
curl https://llama-importaciones.onrender.com/
```

Deberías recibir el HTML de la página.

---

## Troubleshooting

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "Port already in use"
Render usa el puerto 3000 automáticamente. Localmente, prueba:
```bash
PORT=3001 npm start
```

### Cambios no reflejados en Render
1. Haz commit: `git commit -m "tu mensaje"`
2. Push: `git push origin master`
3. Espera 1-2 minutos
4. Refresh: `https://llama-importaciones.onrender.com`

---

**Última actualización:** 2026-04-17
