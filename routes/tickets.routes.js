const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  updateMany,
  getFeaturedTickets,
  getLatestTickets,
  getTicket,
  addTicket,
} = require('../controllers/tickets.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyVendor } = require('../middlewares/vendor/middlewares.js');

router.get('/', getAllTickets);
router.put('/', updateMany);
router.get('/featured', getFeaturedTickets);
router.get('/latest', getLatestTickets);
router.get('/:id', verifyToken, getTicket);
router.post('/', verifyToken, verifyVendor, addTicket);

module.exports = router;
