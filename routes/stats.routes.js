const express = require('express');
const router = express.Router();
const { getWeeklyRevenue } = require('../controllers/stats.controller.js');

router.get('/:email', getWeeklyRevenue);

module.exports = router;
