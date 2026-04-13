# DESIGN SYSTEM - LLAMA IMPORTACIONES

## Paleta de Colores

### Colores Principales
| Variable | Hex | RGB | Uso |
|----------|-----|-----|-----|
| `primary` | #F2EDE8 | 242, 237, 232 | Texto principal, colores claros |
| `primary-container` | #914c18 | 145, 76, 24 | Contenedores secundarios |
| `secondary` | #f8bc5d | 248, 188, 93 | Acentos, hover states, iconos |
| `surface` | #B36843 | 179, 104, 67 | Fondo principal (marrón cálido) |

### Colores de Superficie (Degradación de marrón)
| Variable | Hex | Uso |
|----------|-----|-----|
| `surface-container-lowest` | #6E3F27 | Fondos más oscuros (footer) |
| `surface-container-low` | #9B5938 | Sección de categorías |
| `surface-container` | #A45E3B | Variación media |
| `surface-container-high` | #8E5132 | Cards y contenedores |
| `surface-container-highest` | #7B462C | Hover states de cards |

### Colores Especiales
| Elemento | Hex | Uso |
|----------|-----|-----|
| `on-surface` | #F2EDE8 | Texto sobre superficies oscuras |
| `outline` | #D9C2B5 | Bordes y divisores |
| `outline-variant` | #8E5132 | Bordes secundarios |
| `background` | #B36843 | Color de fondo body |
| Sello de control | #0a4a3c | Sección especial verde oscuro |
| Dorado sello | #f2b759 | Accento en sello de control |

---

## Tipografía

### Familias de Fuentes

#### **Bebas Neue**
- **Uso**: Headings grandes, títulos impactantes
- **Peso**: 400 (Normal)
- **Características**: Fuente serif moderna, muy legible en tamaños grandes
- **Clases Tailwind**: `font-bebas`
- **Ejemplos de uso**:
  - H1 (Hero): `text-9xl md:text-[14rem]` - "LLEGÓ."
  - H2 (Secciones): `text-6xl md:text-8xl`
  - H3 (Cards): `text-3xl` - "BAZAR & COCINA"

#### **Michroma**
- **Uso**: Textos pequeños, uppercase, labels, navegación
- **Peso**: 400 (Normal)
- **Características**: Geométrica, moderna, perfecta para textos en mayúsculas
- **Clases Tailwind**: `font-michroma`
- **Ejemplos de uso**:
  - Navigation: `text-[10px] tracking-[0.15em] uppercase`
  - Labels: `text-[9px] text-center` (sello de control)
  - Subtítulos: `text-xs md:text-sm tracking-[0.4em]`

#### **Inter**
- **Uso**: Body text, párrafos, texto legible en tamaño pequeño
- **Peso**: 300, 400, 700
- **Características**: Sans-serif modern, óptima legibilidad
- **Clases Tailwind**: `font-body`
- **Ejemplos de uso**:
  - Párrafos: `text-lg opacity-90 leading-relaxed`
  - Descripción de pasos: `text-on-surface opacity-80`

### Escalas de Tamaño

#### Headings
```
H1 (Hero):     text-9xl md:text-[14rem]     → ~144px-224px
H2 (Secciones): text-6xl md:text-8xl        → ~60px-96px
H3 (Cards):    text-3xl md:text-4xl         → ~30px-36px
H4 (Footer):   text-4xl                     → ~36px
```

#### Body Text
```
Body Large:   text-lg                        → ~18px
Body Normal:  text-base (default)            → ~16px
Body Small:   text-sm                        → ~14px
Caption:      text-[10px]                    → ~10px
```

### Letter Spacing

| Uso | Valor Tailwind | Descripción |
|-----|-----------------|------------|
| Nav links | `tracking-[0.15em]` | Espaciado muy apretado para uppercase |
| Headings | `tracking-tighter` o `tracking-tight` | Comprimido |
| Subtítulos | `tracking-[0.4em]` | Muy espaciado |
| Labels | `tracking-[0.2em]` | Medio espaciado |
| Botones | `tracking-widest` | Muy espaciado |

### Line Height (Leading)

| Caso | Valor | Uso |
|------|-------|-----|
| Headings | `leading-none` o `leading-[0.9]` | Comprimido |
| Body | `leading-relaxed` | ~1.625 para legibilidad |
| Párrafos | `leading-snug` | ~1.375 |

---

## Espaciado (Spacing)

### Verticales (Padding/Margin)
```
Secciones:      py-32  →  128px (normal)
Secciones alt:  py-24  →  96px  (más compacto)
Header:         py-6   →  24px
Contenedores:   p-8    →  32px
Cards:          p-12   →  48px
```

### Horizontales (Padding)
```
Contenedor:     px-8   →  32px
Ancho máximo:   max-w-screen-2xl
Gaps (Grid):    gap-4  →  16px (normal)
                gap-6  →  24px
                gap-8  →  32px
```

---

## Border Radius

| Caso | Valor | Ejemplo |
|------|-------|---------|
| Default | `rounded` → 0.125rem | Mínimo |
| Buttons | `rounded-lg` → 0.25rem | Muy sutil |
| Cards | `rounded-lg` → 0.25rem | Esquinas sutiles |
| Sello | `rounded-full` → 0.75rem | Más redondeado |

---

## Componentes

### Botones

#### Botón Primario (CTA)
```html
<button class="bg-[#F2EDE8] text-[#B36843] px-12 py-4 rounded-lg font-bebas text-2xl tracking-widest hover:bg-secondary transition-all">
  VER CATÁLOGO
</button>
```
- **Fondo**: Blanco (#F2EDE8)
- **Texto**: Marrón oscuro (#B36843)
- **Hover**: Cambia a secundario (#f8bc5d)
- **Transición**: 300ms

#### Botón Secundario (Outline)
```html
<a class="border border-[#F2EDE8]/40 text-on-surface px-12 py-4 rounded-lg font-bebas text-2xl tracking-widest hover:bg-[#B36843]/60">
  CONSULTAR POR DM
</a>
```
- **Borde**: Blanco con 40% opacidad
- **Texto**: Color primario
- **Hover**: Fondo marrón con 60% opacidad
- **Transición**: smooth

### Cards de Categoría
```html
<div class="bg-surface-container-high p-8 rounded-lg border-t-2 border-secondary hover:bg-surface-container-highest">
  <span class="material-symbols-outlined text-secondary mb-6 text-3xl">icon</span>
  <h3 class="font-bebas text-3xl text-on-surface">CATEGORÍA</h3>
</div>
```
- **Fondo**: `surface-container-high` (#8E5132)
- **Borde superior**: 2px en `secondary` (#f8bc5d)
- **Hover**: Cambia a `surface-container-highest`
- **Ícono**: Color `secondary`

### Cards de Redes Sociales
```html
<a class="bg-surface-container-high p-12 rounded-lg border border-[#F2EDE8]/10 hover:border-secondary">
  <span class="material-symbols-outlined text-secondary text-5xl mb-6">icon</span>
  <h3 class="font-bebas text-4xl text-on-surface">RED SOCIAL</h3>
  <span class="font-michroma text-[10px] tracking-widest text-primary opacity-60">HANDLE</span>
</a>
```
- **Borde**: Blanco con 10% opacidad, hover cambia a `secondary`
- **Transición**: 300ms

---

## Header / Navegación

```html
<header class="bg-[#B36843]/90 backdrop-blur-xl sticky z-50 border-b border-[#F2EDE8]/10">
```
- **Fondo**: Marrón con 90% opacidad
- **Efecto**: Blur backdrop (frosted glass)
- **Posición**: Sticky (se queda en top)
- **Z-index**: 50 (arriba de todo)
- **Borde inferior**: Blanco con 10% opacidad

### Navegación Links
```
text-[#F2EDE8] opacity-70 font-michroma text-[10px] uppercase
hover:text-secondary (cambia a #f8bc5d)
```

---

## Secciones Especiales

### Hero Section
- **Min altura**: 90vh (viewport height)
- **Video background**: Cover, con overlay negro 40%
- **Flexbox**: Centrado vertical y horizontalmente
- **Z-index layers**: Video (0), Overlay (10), Contenido (20)

### About Section
- **Grid**: 1 columna mobile, 2 columnas desktop
- **Gap**: 16px (gap-16)
- **Párrafos**: opacity-90, leading-relaxed

### Categories Section
- **Fondo**: `surface-container-low`
- **Grid**: 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
- **Gap**: 4px entre cards

### Trust Badge Section
- **Fondo especial**: #0a4a3c (verde oscuro)
- **Borde**: #f2b759 (dorado)
- **Sello circular**: w-40 h-40, border-2
- **Texto sello**: font-michroma, text-[9px]

### Footer
- **Fondo**: `surface-container-lowest`
- **Grid**: 1 col mobile, 3 cols desktop
- **Borde superior**: Blanco 10% opacidad
- **Opacity**: 50% para enlaces (hover → 100%)

---

## Responsive Breakpoints (Tailwind)

```
sm:  640px   (small phones)
md:  768px   (tablets)
lg:  1024px  (laptops)
xl:  1280px  (desktop)
2xl: 1536px  (large screens)
```

### Patrones de Responsive
- **Hidden mobile**: `hidden md:flex` (mostrar solo en tablet+)
- **Texto**: `text-9xl md:text-[14rem]` (más grande en desktop)
- **Grid**: `grid-cols-1 md:grid-cols-2` (1 col mobile, 2 desktop)

---

## Transiciones y Animaciones

### Duración estándar: 300ms

```css
transition-colors       → Color change
transition-all          → Todos los properties
transition-transform    → Scale, rotate, translate
transition-opacity      → Opacity changes
duration-300           → 300ms timing
```

### Estados Hover
- **Links de nav**: `hover:text-secondary`
- **Botones**: `hover:bg-secondary`
- **Cards**: `hover:bg-surface-container-highest`
- **Bordes**: `hover:border-secondary`

### Estados Active
- **Botones**: `active:scale-95` (pequeña escala al presionar)

---

## Utilidades de Tailwind Personalizadas

### Border Radius Personalizado
```javascript
borderRadius: {
  "DEFAULT": "0.125rem",
  "lg": "0.25rem",
  "xl": "0.5rem",
  "full": "0.75rem"
}
```

### Font Family Personalizada
```javascript
fontFamily: {
  "bebas": ["Bebas Neue", "sans-serif"],
  "michroma": ["Michroma", "sans-serif"],
  "body": ["Inter", "sans-serif"]
}
```

---

## Iconografía (Material Symbols)

### Cómo usar
```html
<span class="material-symbols-outlined text-secondary mb-6 text-3xl">icon_name</span>
```

### Configuración global
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

### Iconos usados en la página
- `restaurant` - Bazar & Cocina
- `electrical_services` - Electrónica
- `home` - Hogar
- `self_care` - Cuidado Personal
- `devices` - Tecnología
- `category` - Varios
- `photo_camera` - Instagram
- `play_circle` - TikTok
- `chat` - WhatsApp
- `star` (filled) - Sello de control

---

## Modo Oscuro

La página siempre está en modo oscuro:
```html
<html class="dark">
```

**No hay toggle de modo claro/oscuro implementado**. Si se necesita, usar `prefers-color-scheme` media query.

---

## Checklist de Diseño

- [ ] Todos los textos respetan familia de fuentes asignada
- [ ] Colores solo usan las definidas en la paleta
- [ ] Espacios usan escala Tailwind (py-24, px-8, etc.)
- [ ] Transiciones están en 300ms
- [ ] Botones tienen hover states
- [ ] Cards tienen efectos interactivos
- [ ] Layout es responsive (mobile, tablet, desktop)
- [ ] Contraste de color cumple WCAG AA
- [ ] Ícones están en color `secondary` (#f8bc5d)

---

**Última actualización**: 2026-04-12
