const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contactController');
const { validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');
const { idParam } = require('../schemas/common');
const { contactCreate, contactStatusUpdate } = require('../schemas/contact');

router.post('/', validate({ body: contactCreate }), ctrl.createContact);
router.get('/', requireAdmin, ctrl.listContacts);
router.patch('/:id/status', requireAdmin,
    validate({ params: idParam, body: contactStatusUpdate }), ctrl.updateContactStatus);

module.exports = router;
