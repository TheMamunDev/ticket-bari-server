const express = require('express');
const router = express.Router();
const { payment, paymentSuccess } = require('../controllers/pay.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.post('/', verifyToken, payment);
router.patch('/', verifyToken, paymentSuccess);

module.exports = router;
