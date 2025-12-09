const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  updateTicket,
  getFeaturedTickets,
  getLatestTickets,
  getTicket,
  addTicket,
  vendorTickets,
  deleteTicket,
} = require('../controllers/tickets.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyVendor } = require('../middlewares/vendor/middlewares.js');

router.get('/', getAllTickets);
router.get('/vendor/:email', vendorTickets);
router.patch('/:id', updateTicket);
router.get('/featured', getFeaturedTickets);
router.get('/latest', getLatestTickets);
router.get('/:id', verifyToken, getTicket);
router.post('/', verifyToken, verifyVendor, addTicket);
router.delete('/:id', verifyToken, verifyVendor, deleteTicket);

module.exports = router;
