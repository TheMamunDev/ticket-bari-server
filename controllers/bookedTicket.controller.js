const { ObjectId } = require('mongodb');
const { db } = require('../config/db.js');
const { a } = require('framer-motion/client');
const bookedTicketsCollection = db.collection('bookings');
const usersCollection = db.collection('users');
const ticketsCollection = db.collection('tickets');

// insert user booking
const bookTicket = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const ticketStatus = await ticketsCollection.findOne({
      _id: new ObjectId(data.ticketId),
    });
    if (ticketStatus.status !== 'approved') {
      return res.status(400).send({ massage: 'Ticket is not approved yet' });
    }
    const userRole = await usersCollection.findOne({
      email: req.decoded_email,
    });
    if (userRole.role !== 'user') {
      return res.status(400).send({
        message: 'Only user can book a ticket',
        yourRole: userRole.role,
        type: 'ROLE_ERROR',
      });
    }
    const ticket = { ...data, paymentStatus: 'pending' };
    const result = await bookedTicketsCollection.insertOne(ticket);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server error' });
  }
};

// get user my bookings
const getBookedTickets = async (req, res) => {
  try {
    const email = req.params.email;
    if (email !== req.decoded_email) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    console.log(req.query);
    const { page = 1, limit = 9 } = req.query;
    const skip = (page - 1) * limit;
    const totalItems = await bookedTicketsCollection.countDocuments({
      userEmail: email,
    });
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
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.status(200).send({
      result,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      perPage: limit,
    });
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
