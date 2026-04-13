# LLAMA IMPORTACIONES - Guía del Proyecto

## Resumen
Página web moderna para **LLAMA IMPORTACIONES**, una tienda de importaciones basada en San Salvador de Jujuy. La página es una landing page de una sola página (single-page) que funciona como vitrina de productos y punto de contacto con clientes.

## Stack Tecnológico
- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework de CSS utilities
- **Google Fonts** - Tipografías personalizadas (Bebas Neue, Michroma, Inter)
- **Material Symbols** - Iconografía
- **Vanilla JavaScript** - Sin dependencias externas (por ahora)

## Estructura del Proyecto
```
.
├── code.html              # Archivo principal de la página
├── CLAUDE.md             # Este archivo (guía del proyecto)
├── DESIGN.md             # Especificaciones de diseño y estilo
└── [assets/]             # Carpeta para imágenes y videos (futura)
```

## Cómo Trabajar en Este Proyecto

### Editar el HTML
1. Edita el archivo `code.html` directamente
2. Los cambios se reflejan inmediatamente en el navegador (refresh)
3. Usa clases de Tailwind CSS para estilos, no CSS inline cuando sea posible

### Agregar Nuevas Secciones
1. Mantén la estructura de secciones semánticas (`<section>`)
2. Usa IDs únicos para cada sección (para navegación)
3. Sigue el patrón de espacios de Tailwind: `py-32` para espacios verticales

### Cambiar Colores o Tipografía
- **NUNCA** cambies los valores en la configuración de Tailwind sin actualizar `DESIGN.md`
- Todos los cambios de color/tipografía deben documentarse

### Testing
- Abre `code.html` en un navegador moderno (Chrome, Firefox, Safari, Edge)
- Prueba en **mobile** (redimensiona a 320px de ancho)
- Prueba en **desktop** (1920px+)
- Verifica los links de navegación y botones funcionen

## Secciones de la Página

| Sección | ID | Propósito |
|---------|-----|----------|
| Header | - | Navegación principal y CTA |
| Hero | `#hero` | Presentación principal |
| About | `#about` | Valores y misión |
| Categories | `#categories` | Catálogo de productos |
| How to Buy | `#how-to-buy` | Pasos de compra |
| Trust Badge | `#trust` | Control de calidad |
| Social Networks | `#socials` | Redes sociales |
| Contact | - | Llamada a acción final |
| Footer | - | Información de contacto |

## Componentes Clave

### Botones
- Botón primario: `bg-[#F2EDE8] text-[#B36843]` (blanco sobre marrón)
- Botón secundario: `border border-[#F2EDE8]` (borde blanco)
- Hover states implementados

### Cards de Categorías
- Estructura: ícono + título
- Hover: cambio de fondo a `surface-container-highest`
- Borde superior en color `secondary` (#f8bc5d)

### Tipografía Headings
- `font-bebas` - Para títulos grandes
- `font-michroma` - Para texto pequeño y uppercase
- `font-body` - Para párrafos y body text

## Próximas Mejoras / TODO
- [ ] Integración con Backend (formularios de contacto)
- [ ] Galería de productos dinámicos
- [ ] Sistema de carrito (si es e-commerce)
- [ ] Optimización de video de hero
- [ ] PWA (opcional)

## Contacto / Información de Llama Importaciones
- **Ubicación**: San Salvador de Jujuy
- **WhatsApp**: 3884046739
- **Instagram**: @LLAMA.IMPORTACIONES
- **TikTok**: @LLAMA.IMPORTACIONES

---

**Última actualización**: 2026-04-12
