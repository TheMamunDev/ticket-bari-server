const { db } = require('../config/db.js');
const ticketsCollection = db.collection('tickets');

const getAllTickets = async (req, res) => {
  const result = await ticketsCollection.find().toArray();
  res.status(200).send(result);
};

module.exports = { getAllTickets };
