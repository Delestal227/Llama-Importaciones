const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { validate } = require('../middleware/validate');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { idParam } = require('../schemas/common');
const { orderCreate, orderStatusUpdate, orderListQuery } = require('../schemas/order');

router.post('/', optionalAuth, validate({ body: orderCreate }), ctrl.createOrder);
router.get('/', requireAuth, validate({ query: orderListQuery }), ctrl.listOrders);
router.get('/:id', requireAuth, validate({ params: idParam }), ctrl.getOrder);
router.patch('/:id/status', requireAdmin,
    validate({ params: idParam, body: orderStatusUpdate }), ctrl.updateStatus);

module.exports = router;
