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
      .find({ isAdvertised: true })
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

const vendorTickets = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { vendorEmail: email };
    const result = await ticketsCollection.find(query).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const addTicket = async (req, res) => {
  try {
    const ticket = req.body;
    console.log(ticket);
    const result = await ticketsCollection.insertOne(ticket);
    res.send({
      message: 'Ticket added successfully',
      result,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log(query);
    const { _id, ...data } = req.body;
    console.log(data);
    const updatedData = {
      $set: data,
    };
    const result = await ticketsCollection.updateOne(query, updatedData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

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

module.exports = {
  getAllTickets,
  updateTicket,
  getFeaturedTickets,
  getLatestTickets,
  getTicket,
  addTicket,
  vendorTickets,
  deleteTicket,
};
