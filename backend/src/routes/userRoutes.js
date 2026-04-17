const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParam } = require('../schemas/common');

router.get('/', requireAdmin, ctrl.listUsers);
router.patch('/:id/role', requireAdmin, validate({ params: idParam }), ctrl.updateUserRole);

module.exports = router;
