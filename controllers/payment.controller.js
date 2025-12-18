const { db } = require('../config/db.js');
const paymentsCollection = db.collection('payments');
const ticketsCollection = db.collection('tickets');
const { ObjectId } = require('mongodb');

const getPayments = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { userEmail: { $regex: email, $options: 'i' } };
    const result = await paymentsCollection.find(query).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const getPayment = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const query = { _id: new ObjectId(id) };
    const result = await paymentsCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $addFields: {
            ticketIdObj: { $toObjectId: '$ticketId' },
          },
        },
        {
          $lookup: {
            from: 'tickets',
            localField: 'ticketIdObj',
            foreignField: '_id',
            as: 'ticketInfo',
          },
        },

        { $unwind: '$ticketInfo' },
        {
          $project: {
            _id: 1,
            amount: 1,
            bookingId: 1,
            ticketTitle: 1,
            quantity: 1,
            paymentStatus: 1,
            transactionId: 1,
            userEmail: 1,
            userName: 1,
            'ticketInfo.departureTime': 1,
            'ticketInfo.departureDate': 1,
            'ticketInfo.from': 1,
            'ticketInfo.to': 1,
            'ticketInfo.price': 1,
          },
        },
      ])
      .toArray();
    res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getPayments, getPayment };
