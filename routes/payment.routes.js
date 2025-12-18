const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPayment,
} = require('../controllers/payment.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.get('/:email', verifyToken, getPayments);
router.get('/:id/invoice', verifyToken, getPayment);

module.exports = router;
