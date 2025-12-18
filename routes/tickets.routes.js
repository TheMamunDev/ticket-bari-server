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
  getTickets,
  statusUpdate,
  setAdverties,
  updateMany,
  getTrasports,
} = require('../controllers/tickets.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyVendor } = require('../middlewares/vendor/middlewares.js');
const { verifyAdmin } = require('../middlewares/admin/middlewares.js');

router.get('/', getAllTickets);
router.get('/vendor/:email', vendorTickets);
router.patch('/many', updateMany);
router.patch('/:id', updateTicket);
router.patch('/status/:id', statusUpdate);
router.patch('/advertise/:id', setAdverties);
router.get('/transport', getTrasports);
router.get('/featured', getFeaturedTickets);
router.get('/latest', getLatestTickets);
router.get('/all', verifyToken, verifyAdmin, getTickets);
router.get('/:id', verifyToken, getTicket);
router.post('/', verifyToken, verifyVendor, addTicket);
router.delete('/:id', verifyToken, verifyVendor, deleteTicket);

module.exports = router;
