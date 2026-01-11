const { ObjectId } = require('mongodb');
const { db } = require('../config/db.js');
const ticketsCollection = db.collection('tickets');
const usersCollection = db.collection('users');
const reviewsCollection = db.collection('reviews');
const parseDateTime = require('../utils/timeFormate.js');

// get all tickets  for all tickets page with search functionality and pagination
const getAllTickets = async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      transport: category,
      sort,
      page = 1,
      limit = 9,
    } = req.query;
    const query = { status: 'approved' };
    const orConditions = [];
    if (from) {
      orConditions.push({ from: { $regex: from, $options: 'i' } });
      orConditions.push({ title: { $regex: from, $options: 'i' } });
    }
    if (to) {
      orConditions.push({ to: { $regex: to, $options: 'i' } });
      orConditions.push({ title: { $regex: to, $options: 'i' } });
    }
    if (orConditions.length > 0) query.$or = orConditions;
    if (category && category !== 'All') {
      query.transportType = { $regex: category, $options: 'i' };
    }
    if (date) query.departureDate = date;
    let sortObj = { createdAt: -1 };

    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'Default') sortObj = { createdAt: -1 };
    const skip = (page - 1) * limit;

    const totalItems = await ticketsCollection.countDocuments(query);
    const categories = await ticketsCollection.distinct('transportType');
    const result = await ticketsCollection
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(10)
      .toArray();
    res.status(200).send({
      result,
      categories,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      perPage: limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
};

// get all transports for show in the search filter
const getTrasports = async (req, res) => {
  try {
    const result = await ticketsCollection.distinct('transportType');
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// get all tickets for admin , protected
const getTickets = async (req, res) => {
  const status = req.query.status;
  const query = {};
  if (status) {
    query.status = status;
  }
  try {
    const result = await ticketsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server error' });
  }
};

const getTicket = async (req, res) => {
  try {
    const now = new Date();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await ticketsCollection.findOne(query);

    if (!result) {
      return res.status(400).send({ message: 'Ticket not found' });
    }
    const relevantTickets = (
      await ticketsCollection
        .aggregate([
          {
            $match: {
              status: 'approved',
              _id: { $ne: new ObjectId(id) },
              transportType: result.transportType,
            },
          },
          { $sample: { size: 4 } },
        ])
        .toArray()
    ).filter(ticket => {
      const dt = parseDateTime(ticket.departureDate, ticket.departureTime);
      return dt && dt > now;
    });
    const reviews = await reviewsCollection.find({ ticketId: id }).limit(3).toArray();
    res.status(200).send({ result, relevantTickets, reviews });
  } catch (error) {
    res.status(404).send({ message: 'Invalid Ticket ID' });
    console.log(error);
  }
};

const getFeaturedTickets = async (req, res) => {
  try {
    const result = await ticketsCollection
      .find({ isAdvertised: true })
      .limit(6)
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getLatestTickets = async (req, res) => {
  try {
    const result = await ticketsCollection
      .find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// get all tickets by vendor , protected
const vendorTickets = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { vendorEmail: email };
    const result = await ticketsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server error' });
  }
};

const addTicket = async (req, res) => {
  try {
    const ticket = req.body;
    const user = await usersCollection.findOne({ email: req.decoded_email });
    if (user.isFraud) {
      return res.status(409).send({
        message: 'Your account is flagged for fraud. You cannot add tickets.',
      });
    }
    const result = await ticketsCollection.insertOne(ticket);
    res.send({
      message: 'Ticket added successfully',
      result,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// update ticket by vendor ,protected
const updateTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const { _id, ...data } = req.body;
    const updatedData = {
      $set: data,
    };
    const result = await ticketsCollection.updateOne(query, updatedData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// update ticket status by admin , protected
const statusUpdate = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const { _id, ...data } = req.body;
    const updatedData = {
      $set: { status: data.status },
    };
    const result = await ticketsCollection.updateOne(query, updatedData);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server error' });
  }
};

// delete ticket by vendor , protected
const deleteTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await ticketsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

// set ticket as advertise by admin , protected
const setAdverties = async (req, res) => {
  const id = req.params;
  const { currentStatus } = req.body;
  try {
    if (currentStatus === true) {
      const currentCount = await ticketsCollection.countDocuments({
        isAdvertised: true,
      });
      if (currentCount >= 6) {
        return res.status(400).json({
          success: false,
          message:
            'Limit Reached: You can only advertise up to 6 tickets. Please unadvertise one first.',
        });
      }
    }

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        isAdvertised: currentStatus,
      },
    };

    const result = await ticketsCollection.updateOne(filter, updateDoc);

    res.status(200).send({
      success: true,
      message: currentStatus
        ? 'Ticket is now Live on Home.'
        : 'Ticket removed from Home.',
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllTickets,
  updateTicket,
  getFeaturedTickets,
  getLatestTickets,
  getTicket,
  addTicket,
  vendorTickets,
  deleteTicket,
  getTickets,
  statusUpdate,
  setAdverties,
  getTrasports,
};
