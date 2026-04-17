const { z } = require('zod');

const contactCreate = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional().nullable(),
    message: z.string().min(1).max(2000),
});

const contactStatusUpdate = z.object({
    status: z.enum(['new', 'contacted', 'resolved', 'archived']),
});

module.exports = { contactCreate, contactStatusUpdate };
