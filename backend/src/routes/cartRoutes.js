const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { cartUpsert } = require('../schemas/cart');

router.use(requireAuth);
router.get('/', ctrl.getCart);
router.put('/', validate({ body: cartUpsert }), ctrl.upsertCart);
router.delete('/', ctrl.clearCart);

module.exports = router;
