const express = require('express');
const router = express.Router();

const {
  bookTicket,
  getBookedTickets,
  getBookingByVendor,
  updateTicket,
} = require('../controllers/bookedTicket.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.get('/vendor/:email', getBookingByVendor);
router.get('/:email', getBookedTickets);
router.post('/', verifyToken, bookTicket);
router.patch('/:id', updateTicket);

module.exports = router;
