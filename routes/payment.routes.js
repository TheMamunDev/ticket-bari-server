const express = require('express');
const router = express.Router();
const { getPayments } = require('../controllers/payment.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.get('/:email', verifyToken, getPayments);

module.exports = router;
