const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { googleLogin } = require('../schemas/auth');

router.post('/google', validate({ body: googleLogin }), ctrl.googleLogin);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
