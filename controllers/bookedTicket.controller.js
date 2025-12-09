const { ObjectId } = require('mongodb');
const { db } = require('../config/db.js');
const { m } = require('framer-motion');
const bookedTicketsCollection = db.collection('bookings');

const bookTicket = async (req, res) => {
  try {
    const data = req.body;
    const ticket = { ...data, paymentStatus: 'pending' };
    const result = await bookedTicketsCollection.insertOne(ticket);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const getBookedTickets = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { userEmail: email };
    const result = await bookedTicketsCollection
      .aggregate([
        { $match: { userEmail: email } },

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
            userEmail: 1,
            ticketId: 1,
            ticketTitle: 1,
            quantity: 1,
            totalPrice: 1,
            status: 1,
            bookingDate: 1,
            unitPrice: 1,
            'ticketInfo.departureTime': 1,
            'ticketInfo.departureDate': 1,
            'ticketInfo.image': 1,
          },
        },
      ])
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const getBookingByVendor = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { vendorEmail: email };
    const result = await bookedTicketsCollection.find(query).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const updateTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const { status } = req.body;
    const updatedData = {
      $set: { status },
    };

    const result = await bookedTicketsCollection.updateOne(query, updatedData);
    res.send({ result, status });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  bookTicket,
  getBookedTickets,
  getBookingByVendor,
  updateTicket,
};
