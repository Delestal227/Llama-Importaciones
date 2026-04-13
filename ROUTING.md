# Configuración de Routing - LLAMA IMPORTACIONES

## Estado Actual ✅

El sitio utiliza **pathname-based routing** (sin hash) con URLs como:
- `https://llama-importaciones.onrender.com/`
- `https://llama-importaciones.onrender.com/categorias`
- `https://llama-importaciones.onrender.com/catalogo`

## Cómo Funciona

1. **Archivo `render.yaml`** - Configura Render para servir `index.html` para todas las rutas
2. **JavaScript client-side** - El código maneja el routing y muestra/oculta secciones sin recargar
3. **History API** - Usa `history.pushState()` para cambiar la URL sin recargar

## Rutas Disponibles

| URL | Sección |
|-----|---------|
| `/` | Hero (Inicio) |
| `/inicio` | Hero (Alias) |
| `/sobre` | Sobre Nosotros |
| `/categorias` | Categorías de Productos |
| `/catalogo` | Catálogo Completo |
| `/como-comprar` | Cómo Comprar |
| `/contacto` | Contacto |
| `/redes-sociales` | Redes Sociales |
| `/categorias/bazar` | Catálogo filtrado por Bazar & Cocina |
| `/categorias/electronica` | Catálogo filtrado por Electrónica |
| `/categorias/hogar` | Catálogo filtrado por Hogar |
| `/categorias/cuidado` | Catálogo filtrado por Cuidado Personal |
| `/categorias/tecnologia` | Catálogo filtrado por Tecnología |

## Configuración para Otros Hosts

### Netlify

Crea un archivo `_redirects`:
```
/* /index.html 200
```

### Vercel

Usa `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### GitHub Pages

No soporta pathname routing directo. Usar hash-based routing en su lugar.

---

**Última actualización**: 2026-04-13
