const { db } = require('../config/db.js');
const paymentsCollection = db.collection('payments');

require('dotenv').config();


const payment = async (req, res) => {
  const paymentInfo = req.body;
  console.log(paymentInfo);
  const amount = parseInt(paymentInfo.amount) * 100;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: paymentInfo.percelName,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      percelId: paymentInfo.percelId,
    },
    customer_email: paymentInfo.senderEmail,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/payment-cancel`,
  });
  res.send({ url: session.url });
};

const paymentSuccess = async (req, res) => {
  const trackingId = generateTrackingId();
  const sessionId = req.query.session_id;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const transactionId = session.payment_intent;
  if (session.payment_status === 'paid') {
    const paymentExist = await paymentsCollection.findOne({
      transactionId: transactionId,
    });
    if (paymentExist) {
      return res.send({
        success: false,
        meassage: 'Payment already done',
        trackingId: trackingId,
        transactionId: transactionId,
      });
    }

    const percelId = session.metadata.percelId;
    const result = await percelsCollection.updateOne(
      { _id: new ObjectId(percelId) },
      {
        $set: {
          paymentStatus: 'paid',
          paidAt: new Date(),
          trackingId: trackingId,
        },
      }
    );
    const paymentInfo = {
      percelId: percelId,
      customerEmail: session.customer_email,
      amount: session.amount_total / 100,
      transactionId: session.payment_intent,
      paymentStatus: 'paid',
      paidAt: new Date(),
      trackingId: trackingId,
    };
    const paymentResult = await paymentsCollection.insertOne(paymentInfo);
    return res.send({
      success: true,
      modifiedInfo: paymentInfo,
      trackingId,
      paymentResult: paymentResult,
    });
  }
  res.send({ success: false });
};

module.exports = { payment, paymentSuccess };
