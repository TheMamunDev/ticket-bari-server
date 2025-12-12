const express = require('express');
const router = express.Router();
const {
  bookTicket,
  getBookedTickets,
  getBookingByVendor,
  updateTicket,
} = require('../controllers/bookedTicket.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyVendor } = require('../middlewares/vendor/middlewares.js');

router.get('/vendor/:email', verifyToken, verifyVendor, getBookingByVendor);

// user bookings by user email
router.get('/:email', verifyToken, getBookedTickets);

// book a ticket by user
router.post('/', verifyToken, bookTicket);

// update bookings as accept or reject by vendor
router.patch('/:id', verifyToken, verifyVendor, updateTicket);

module.exports = router;
