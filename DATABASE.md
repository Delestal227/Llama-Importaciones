# Base de Datos Neon (PostgreSQL) - LLAMA IMPORTACIONES

## Setup Inicial

### 1. Obtener Connection String de Neon

1. Entra a https://console.neon.tech
2. Selecciona tu proyecto
3. Dashboard -> **Connection Details**
4. Copia el string que se ve asi:
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Configurar en Render

1. Dashboard Render -> tu servicio
2. **Environment** -> Add Environment Variable
3. Key: `DATABASE_URL`
4. Value: el connection string de Neon
5. Save Changes

### 3. Configurar en Local (Desarrollo)

Crea archivo `.env` en la raiz del proyecto:
```
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/dbname?sslmode=require
```

### 4. Ejecutar Migracion (crear tablas)

```bash
npm run migrate
```

Salida esperada:
```
Conectado a Neon: 2026-04-17T...
Schema aplicado correctamente
Tablas creadas: carts, contacts, order_items, orders, products, users
```

## Tablas

| Tabla | Proposito |
|-------|----------|
| `users` | Usuarios de Google Sign-In |
| `products` | Catalogo de productos |
| `carts` | Carrito persistente por usuario |
| `orders` | Ordenes/pedidos |
| `order_items` | Items de cada orden |
| `contacts` | Formulario de contacto |

## Endpoints API

### Health Check
- `GET /api/health` - Verifica conexion a BD

### Productos
- `GET /api/products?category=bazar&active=true` - Listar
- `GET /api/products/:id` - Obtener uno
- `POST /api/products` - Crear
- `PUT /api/products/:id` - Actualizar
- `DELETE /api/products/:id` - Eliminar

### Usuarios
- `POST /api/users` - Crear/actualizar (upsert)
- `GET /api/users/:email` - Obtener

### Carrito
- `GET /api/cart/:email` - Obtener items
- `POST /api/cart/:email` - Guardar items
- `DELETE /api/cart/:email` - Vaciar

### Ordenes
- `POST /api/orders` - Crear orden (con items)
- `GET /api/orders?email=x&status=pending` - Listar
- `GET /api/orders/:id` - Obtener con items
- `PUT /api/orders/:id/status` - Cambiar estado

### Contactos
- `POST /api/contact` - Crear
- `GET /api/contacts?status=new` - Listar

## Ejemplos de Uso

### Crear producto
```bash
curl -X POST https://llama-importaciones.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LLAMA-VAJ-001",
    "name": "Vajilla Premium",
    "description": "Set de vajilla 12 piezas",
    "price": 300,
    "stock": 5,
    "category": "bazar",
    "images": ["https://res.cloudinary.com/..."],
    "videos": []
  }'
```

### Crear orden
```bash
curl -X POST https://llama-importaciones.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "cliente@gmail.com",
    "customer_name": "Juan Perez",
    "customer_phone": "3884046739",
    "delivery_type": "envio",
    "payment_method": "transferencia",
    "items": [
      {"product_id": 1, "product_name": "Vajilla", "quantity": 1, "unit_price": 300}
    ]
  }'
```

## Migracion de Google Sheets a Neon

Para migrar productos existentes del Google Sheet a Neon:

1. Exporta el Google Sheet como CSV
2. Usa un script (puedo prepararlo) o inserta manualmente via:
   ```sql
   INSERT INTO products (sku, name, price, stock, category, images)
   VALUES ('SKU-001', 'Producto', 100, 10, 'bazar', '["url1"]'::jsonb);
   ```

## Troubleshooting

### Error: "connection refused"
- Verifica que `DATABASE_URL` este bien configurada
- Verifica que el sslmode=require este en el string
- Neon free tier puede estar dormido, primera conexion tarda ~5s

### Error: "relation does not exist"
- Ejecuta `npm run migrate` para crear las tablas

### Ver logs en Render
Dashboard Render -> tu servicio -> Logs
