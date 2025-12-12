const { db } = require('../config/db.js');
const paymentsCollection = db.collection('payments');
const bookedTicketsCollection = db.collection('bookings');
const ticketsCollection = db.collection('tickets');
const { ObjectId } = require('mongodb');
const timeFormate = require('../utils/timeFormate.js');
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
require('dotenv').config();

const payment = async (req, res) => {
  const data = req.body;
  try {
    const ticket = await ticketsCollection.findOne({
      _id: new ObjectId(data.ticketId),
    });
    if (!ticket) {
      return res.send({ success: false, message: 'Ticket not found' });
    }

    const departure = timeFormate(ticket.departureDate, ticket.departureTime);
    const now = new Date();

    if (!departure || departure <= now) {
      return res.status(400).send({
        message: 'Ticket departure time has passed',
        expired: true,
      });
    }

    if (ticket.quantity < data.quantity) {
      return res.send({
        success: false,
        message: 'Not enough Seat Available',
        available: ticket.quantity,
      });
    }
    const paymentInfo = {
      ...data,
      paidAt: new Date(),
    };
    console.log(paymentInfo);
    const amount = parseInt(paymentInfo.totalPrice) * 100;
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: paymentInfo.ticketTitle,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: paymentInfo.bookingId,
        ticketId: paymentInfo.ticketId,
        quantity: paymentInfo.quantity,
      },
      customer_email: paymentInfo.userEmail,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard/user/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/user/payment-cancelled`,
    });
    res.send({ url: session.url });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const paymentSuccess = async (req, res) => {
  const sessionId = req.query.session_id;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const transactionId = session.payment_intent;

  if (session.payment_status === 'paid') {
    const bookingId = session.metadata.bookingId;
    const quantity = Number(session.metadata.quantity);
    const paymentExist = await paymentsCollection.findOne({ transactionId });
    if (paymentExist) {
      return res.send({
        success: false,
        message: 'Payment already done',
        transactionId: transactionId,
      });
    }

    const ticket = await ticketsCollection.findOne({
      _id: new ObjectId(session.metadata.ticketId),
    });

    const paymentInfo = {
      bookingId: bookingId,
      ticketId: session.metadata.ticketId,
      ticketTitle: ticket.title,
      userEmail: session.customer_email,
      amount: session.amount_total / 100,
      transactionId: transactionId,
      paymentStatus: 'paid',
      paidAt: new Date(),
    };
    try {
      const paymentResult = await paymentsCollection.insertOne(paymentInfo);
      await bookedTicketsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { status: 'paid', paidAt: new Date() } }
      );

      const newQuantity = ticket.quantity - quantity;
      await ticketsCollection.updateOne(
        { _id: new ObjectId(session.metadata.ticketId) },
        { $set: { quantity: newQuantity } }
      );
      return res.send({
        success: true,
        modifiedInfo: paymentInfo,
        paymentResult: paymentResult,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.send({
          success: false,
          message: 'Payment already processed (Duplicate Prevention)',
        });
      }
      console.error(error);
      return res.send({ success: false, message: 'Internal Server Error' });
    }
  }
  res.send({ success: false });
};

module.exports = { payment, paymentSuccess };
