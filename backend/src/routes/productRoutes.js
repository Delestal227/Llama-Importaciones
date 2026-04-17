const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const { idParam } = require('../schemas/common');
const { productCreate, productUpdate, productListQuery } = require('../schemas/product');

router.get('/', cacheMiddleware(60), validate({ query: productListQuery }), ctrl.getProducts);
router.get('/:id', validate({ params: idParam }), ctrl.getProductById);
router.post('/', requireAdmin, validate({ body: productCreate }), ctrl.createProduct);
router.put('/:id', requireAdmin, validate({ params: idParam, body: productUpdate }), ctrl.updateProduct);
router.delete('/:id', requireAdmin, validate({ params: idParam }), ctrl.deleteProduct);

module.exports = router;
