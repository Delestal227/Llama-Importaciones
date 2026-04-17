# Configuración de Seguridad - LLAMA IMPORTACIONES

## Vulnerabilidades Corregidas

### ✅ Content-Security-Policy
**Antes:** ❌ Falta (permite ejecución de scripts no autorizados y XSS)  
**Ahora:** ✅ Configurada

Directivas aplicadas:
- `defaultSrc: ['self']` - Solo scripts del mismo origen por defecto
- `scriptSrc` - Tailwind CDN, Google Accounts permitidos
- `styleSrc` - Google Fonts y Tailwind CDN permitidos
- `imgSrc` - Datos y HTTPS habilitados para imágenes

---

### ✅ X-Frame-Options
**Antes:** ❌ Ausente (susceptible a clickjacking)  
**Ahora:** ✅ `DENY` - No se puede embeber en frames

---

### ✅ Strict-Transport-Security (HSTS)
**Antes:** ❌ No configurado (comunicación expuesta)  
**Ahora:** ✅ Habilitado por 1 año

```
max-age: 31536000
includeSubDomains: true
preload: true
```

---

### ✅ X-Content-Type-Options
**Antes:** ❌ Sin protección (MIME sniffing)  
**Ahora:** ✅ `nosniff` - Previene ejecución de archivos maliciosos

---

### ✅ Referrer-Policy
**Antes:** ❌ No definida (filtra datos de navegación)  
**Ahora:** ✅ Configurada (helmet agrega por defecto)

---

### ✅ Permissions-Policy
**Antes:** ❌ Falta restricción de cámara/geolocalización  
**Ahora:** ✅ Helmet restringe permisos del navegador

---

### ✅ Información de Servidor Ocultada
**Antes:** ❌ Expone "Cloudflare" en headers  
**Ahora:** ✅ Helmet remueve headers innecesarios

---

### ✅ robots.txt y sitemap.xml
**Antes:** ❌ Ausentes (dificulta rastreo)  
**Ahora:** ✅ Creados y configurados

---

## Headers de Respuesta HTTP

Todos estos headers se envían automáticamente:

```
Content-Security-Policy: ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-Powered-By: (removido)
Strict-Transport-Security: max-age=31536000...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: (restricciones configuradas)
CORS: habilitado para el mismo origen
```

---

## Rate Limiting

**Límite:** 100 peticiones por 15 minutos  
**Protege contra:** Fuerza bruta, DDoS básicos

Aplicado a todas las rutas automáticamente.

---

## Validación de Entrada

Todos los endpoints validan campos requeridos y limitan tamaño de payload:
- JSON: máximo 10MB
- URL-encoded: máximo 10MB

---

## Para Transacciones Futuras

Cuando integres pagos (Stripe, etc.):

1. **Valida SIEMPRE en backend** - Nunca confíes en datos del cliente
2. **Usa HTTPS obligatoriamente** - Ya forzado por HSTS
3. **Rate limit más estricto** - Para endpoints de pago (1-10 por minuto)
4. **Cifra datos sensibles** - Contraseñas, tokens, números de tarjeta
5. **Implement JWT** - Para autenticación de usuarios
6. **Logs de auditoría** - Registra todas las transacciones
7. **PCI DSS compliance** - Si almacenas datos de pago

---

## Checklist de Seguridad Aplicado

✅ HTTPS/TLS forzado  
✅ Headers HTTP seguros  
✅ CSP implementada  
✅ CORS configurado  
✅ Rate limiting  
✅ Validación de entrada  
✅ Información de servidor oculta  
✅ Métodos HTTP restringidos  
✅ robots.txt y sitemap.xml  

---

## Testing de Seguridad

Para verificar los headers, abre DevTools:
```
curl -I https://llama-importaciones.onrender.com
```

Deberías ver:
```
strict-transport-security: max-age=31536000...
x-content-type-options: nosniff
x-frame-options: DENY
content-security-policy: ...
```

---

**Última actualización:** 2026-04-17  
**Próximas mejoras:** Autenticación, encriptación de datos, logs de auditoría
