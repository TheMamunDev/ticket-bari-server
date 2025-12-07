const { ObjectId } = require('mongodb');
const { db } = require('../config/db.js');
const ticketsCollection = db.collection('tickets');

const getAllTickets = async (req, res) => {
  const result = await ticketsCollection.find().toArray();
  res.status(200).send(result);
};

const getTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await ticketsCollection.findOne(query);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const getFeaturedTickets = async (req, res) => {
  try {
    const result = await ticketsCollection
      .find({ featured: true })
      .limit(6)
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getLatestTickets = async (req, res) => {
  try {
    const result = await ticketsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const updateMany = async (req, res) => {
  try {
    const result = await ticketsCollection.updateMany(
      {},
      {
        $set: {
          createdAt: new Date(),
        },
      }
    );

    res.send({
      message: 'Updated successfully',
      result,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  getAllTickets,
  updateMany,
  getFeaturedTickets,
  getLatestTickets,
  getTicket,
};
