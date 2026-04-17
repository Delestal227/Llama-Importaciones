const { z } = require('zod');

const mediaItem = z.union([
    z.string().url(),
    z.object({ url: z.string().url() }).passthrough(),
]);

const productCreate = z.object({
    sku: z.string().max(100).optional().nullable(),
    name: z.string().min(1).max(255),
    description: z.string().max(5000).optional().nullable(),
    price: z.coerce.number().nonnegative(),
    stock: z.coerce.number().int().min(0).default(0),
    category: z.string().max(100).optional().nullable(),
    images: z.array(mediaItem).default([]),
    videos: z.array(mediaItem).default([]),
    active: z.boolean().default(true),
});

const productUpdate = productCreate.partial();

const productListQuery = z.object({
    category: z.string().optional(),
    q: z.string().max(100).optional(),
    active: z.enum(['true', 'false', 'all']).default('true'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['created_at', 'price', 'name']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = { productCreate, productUpdate, productListQuery };
