# Importador de Productos - Guia de Uso

Script para importar productos desde un JSON propio a Neon + Cloudinary.

> IMPORTANTE: Usar solo con imagenes y contenido PROPIO. No subir contenido de terceros.

## Requisitos

1. `.env` configurado con:
   ```
   DATABASE_URL=postgresql://...
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   ```

2. Archivo JSON con estructura compatible (ver abajo).

## Estructuras JSON aceptadas

### A) Array plano
```json
[
    {
        "name": "Producto 1",
        "price": 1500,
        "sku": "ABC-001",
        "imageUrl": "https://mi-dominio.com/img1.jpg",
        "category": "Bazar",
        "description": "Descripcion",
        "stock": 10
    }
]
```

### B) Con categorias agrupadas
```json
{
    "categorias": {
        "Bazar": [{"name": "...", "price": "...", "imageUrl": "..."}],
        "Electronica": [{"name": "...", "price": "...", "imageUrl": "..."}]
    }
}
```

### C) Con allProducts
```json
{
    "allProducts": [
        {
            "name": "...",
            "price": "...",
            "imageUrl": "...",
            "categories": ["Cat1"]
        }
    ]
}
```

## Mapeo de Categorias

Edita `scripts/category-map.json` para mapear categorias del JSON a slugs internos:

```json
{
    "Mi Categoria Original": "bazar",
    "Otra": "electronica",
    "_default": "varios"
}
```

Slugs validos: `bazar`, `electronica`, `hogar`, `cuidado`, `tecnologia`, `varios`

## Uso

### Dry-run (no escribe nada, solo muestra que haria)
```bash
npm run import:dry -- mi-archivo.json
```

### Importacion real
```bash
npm run import -- mi-archivo.json
```

### Con archivo por defecto `products-to-import.json`
```bash
npm run import
```

## Que hace

Para cada producto:

1. Lee el JSON y detecta la estructura automaticamente
2. Mapea la categoria usando `category-map.json`
3. Sube la `imageUrl` a Cloudinary (carpeta: `llama-importaciones/products`)
4. Inserta o actualiza en Neon (upsert por SKU si existe)

## Variables opcionales

```
CLOUDINARY_FOLDER=llama-importaciones/products   # Carpeta destino
```

## Troubleshooting

### "CLOUDINARY_URL no configurada"
Agregala al `.env` o usa `--dry-run` para probar sin subir.

### "Fallo upload imagen"
- Verifica que la URL sea publica y accesible
- Verifica cuota de Cloudinary
- Si la URL esta caida, el producto se inserta sin imagen

### "duplicate key value violates unique constraint"
Producto con mismo SKU ya existe. El script hace UPSERT, deberia actualizar. Si falla, revisa el SKU.

### Script tarda mucho
Ajusta `CONCURRENCY` (default: 3) y `BATCH_DELAY_MS` (default: 300) en el script.

## Ejemplo completo

```bash
# 1. Preparar archivo
cp mi-catalogo.json products-to-import.json

# 2. Ver que haria (sin escribir)
npm run import:dry

# 3. Si se ve bien, ejecutar real
npm run import

# 4. Verificar en la web
# https://llama-importaciones.onrender.com
```
