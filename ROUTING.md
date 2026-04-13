# Configuración de Routing - LLAMA IMPORTACIONES

## Estado Actual

El sitio utiliza **hash-based routing** con URLs como:
- `https://llama-importaciones.onrender.com/#/`
- `https://llama-importaciones.onrender.com/#/categorias`
- `https://llama-importaciones.onrender.com/#/catalogo`

## URLs Deseadas (Sin hash)

Si deseas URLs sin el hash (`#/`):
- `https://llama-importaciones.onrender.com/`
- `https://llama-importaciones.onrender.com/categorias`
- `https://llama-importaciones.onrender.com/catalogo`

## Cómo Configurar en Render

1. **Crear un archivo `render.yaml` en la raíz del proyecto:**

```yaml
routes:
  - path: "/*"
    method: "GET"
    route: "index.html"
```

Esto le dice a Render que sirva `index.html` para TODAS las rutas, permitiendo que el JavaScript client-side maneje el routing.

2. **O crear un archivo `.htaccess` (si usa hosting con Apache):**

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

3. **O en Netlify, agregar `_redirects` file:**

```
/* /index.html 200
```

## Cómo Cambiar a Pathname Routing

Si configuraste el servidor, puedes cambiar el código JavaScript de `hash-based` a `pathname-based`:

En `index.html`, busca la sección de routing y cambia:

```javascript
// CAMBIAR DE:
function navigateTo(path) {
    // ... código ...
    window.location.hash = '#/' + path;
}

// A:
function navigateTo(path) {
    // ... código ...
    window.history.pushState({ path }, '', path);
}
```

## Rutas Disponibles

| URL | Sección |
|-----|---------|
| `/` | Hero (Inicio) |
| `/sobre` | Sobre Nosotros |
| `/categorias` | Categorías de Productos |
| `/catalogo` | Catálogo Completo |
| `/como-comprar` | Cómo Comprar |
| `/contacto` | Contacto |
| `/redes-sociales` | Redes Sociales |
| `/carrito` | Carrito (Abre Modal) |
| `/categorias/bazar` | Catálogo filtrado por Bazar & Cocina |
| `/categorias/electronica` | Catálogo filtrado por Electrónica |
| `/categorias/hogar` | Catálogo filtrado por Hogar |
| `/categorias/cuidado` | Catálogo filtrado por Cuidado Personal |
| `/categorias/tecnologia` | Catálogo filtrado por Tecnología |

---

**Última actualización**: 2026-04-13
