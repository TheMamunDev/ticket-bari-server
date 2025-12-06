const express = require('express');
const router = express.Router();
const { getAllTickets } = require('../controllers/tickets.controller.js');

router.get('/', getAllTickets);

module.exports = router;
