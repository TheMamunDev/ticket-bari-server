const express = require('express');
const router = express.Router();
const ticketRoutes = require('../routes/tickets.routes.js');
const userRouter = require('../routes/users.routes.js');
const bookedTicketRouter = require('../routes/bookedTicket.routes.js');

router.get('/', (req, res) => {
  res.send('TicketBari Server is running!');
});

router.use('/tickets', ticketRoutes);
router.use('/user', userRouter);
router.use('/bookings', bookedTicketRouter);

module.exports = router;
