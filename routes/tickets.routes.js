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
  getTrasports,
} = require('../controllers/tickets.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyVendor } = require('../middlewares/vendor/middlewares.js');
const { verifyAdmin } = require('../middlewares/admin/middlewares.js');

router.get('/', getAllTickets);
router.get('/vendor/:email', verifyToken, verifyVendor, vendorTickets);
router.patch('/:id', verifyToken, verifyVendor, updateTicket);
router.patch('/status/:id', verifyToken, verifyAdmin, statusUpdate);
router.patch('/advertise/:id', verifyToken, verifyAdmin, setAdverties);
router.get('/transport', getTrasports);
router.get('/featured', getFeaturedTickets);
router.get('/latest', getLatestTickets);
router.get('/all', verifyToken, verifyAdmin, getTickets);
router.get('/:id', getTicket);
router.post('/', verifyToken, verifyVendor, addTicket);
router.delete('/:id', verifyToken, verifyVendor, deleteTicket);

module.exports = router;
