const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  updateMany,
  getFeaturedTickets,
} = require('../controllers/tickets.controller.js');

router.get('/', getAllTickets);
router.put('/', updateMany);
router.get('/featured', getFeaturedTickets);

module.exports = router;
