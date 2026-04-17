const { z } = require('zod');

const orderItem = z.object({
    product_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
});

const orderCreate = z.object({
    customer_name: z.string().min(1).max(255),
    customer_phone: z.string().min(6).max(50),
    delivery_type: z.enum(['pickup', 'delivery']),
    delivery_address: z.string().max(500).optional().nullable(),
    payment_method: z.enum(['cash', 'transfer', 'card', 'mercadopago']).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    items: z.array(orderItem).min(1),
}).refine(
    d => d.delivery_type !== 'delivery' || (d.delivery_address && d.delivery_address.length > 0),
    { message: 'delivery_address requerido para delivery', path: ['delivery_address'] }
);

const orderStatusUpdate = z.object({
    status: z.enum(['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled']),
});

const orderListQuery = z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { orderCreate, orderStatusUpdate, orderListQuery };
