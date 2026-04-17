const { z } = require('zod');

const googleLogin = z.object({
    credential: z.string().min(10),
});

module.exports = { googleLogin };
