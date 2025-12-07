const express = require('express');
const router = express.Router();
const ticketRoutes = require('../routes/tickets.routes.js');
const userRouter = require('../routes/users.routes.js');

router.get('/', (req, res) => {
  res.send('TicketBari Server is running!');
});

router.use('/tickets', ticketRoutes);
router.use('/user', userRouter);

module.exports = router;
