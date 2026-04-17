const { z } = require('zod');

const cartItem = z.object({
    product_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
});

const cartUpsert = z.object({
    items: z.array(cartItem).max(200),
});

module.exports = { cartUpsert };
