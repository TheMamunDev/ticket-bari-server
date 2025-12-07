const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  updateMany,
  getFeaturedTickets,
  getLatestTickets,
  getTicket,
} = require('../controllers/tickets.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.get('/', getAllTickets);
router.put('/', updateMany);
router.get('/featured', getFeaturedTickets);
router.get('/latest', getLatestTickets);
router.get('/:id', verifyToken, getTicket);

module.exports = router;
