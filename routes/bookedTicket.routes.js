const express = require('express');
const router = express.Router();

const {
  bookTicket,
  getBookedTickets,
} = require('../controllers/bookedTicket.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.get('/:email', getBookedTickets);
router.post('/', verifyToken, bookTicket);

module.exports = router;
