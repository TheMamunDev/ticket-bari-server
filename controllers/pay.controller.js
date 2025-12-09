const { db } = require('../config/db.js');
const paymentsCollection = db.collection('payments');
const bookedTicketsCollection = db.collection('bookings');
const ticketsCollection = db.collection('tickets');
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
require('dotenv').config();

const payment = async (req, res) => {
  const data = req.body;
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
};

const paymentSuccess = async (req, res) => {
  const sessionId = req.query.session_id;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const transactionId = session.payment_intent;

  if (session.payment_status === 'paid') {
    const bookingId = session.metadata.bookingId;
    const quantity = Number(session.metadata.quantity);

    const paymentExist = await paymentsCollection.findOne({
      transactionId: session.payment_intent,
    });
    console.log(paymentExist);
    if (paymentExist) {
      return res.send({
        success: false,
        meassage: 'Payment already done',
        transactionId: session.payment_intent,
      });
    }

    const ticket = await ticketsCollection.findOne({
      _id: new ObjectId(session.metadata.ticketId),
    });
    if (!ticket) {
      return res.send({ success: false, message: 'Ticket not found' });
    }

    if (ticket.quantity < quantity) {
      return res.send({
        success: false,
        message: 'Not enough Seat Available',
        available: ticket.quantity,
      });
    }
    const result = await bookedTicketsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
        },
      }
    );
    const newQuantity = ticket.quantity - quantity;

    const ticketUpdate = await ticketsCollection.updateOne(
      { _id: new ObjectId(session.metadata.ticketId) },
      {
        $set: {
          quantity: newQuantity,
        },
      }
    );

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
    const paymentResult = await paymentsCollection.insertOne(paymentInfo);
    console.log(paymentResult);
    return res.send({
      success: true,
      modifiedInfo: paymentInfo,
      paymentResult: paymentResult,
    });
  }
  res.send({ success: false });
};

module.exports = { payment, paymentSuccess };
