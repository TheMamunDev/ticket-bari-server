const { db } = require('../config/db.js');
const ticketsCollection = db.collection('tickets');

const getAllTickets = async (req, res) => {
  const result = await ticketsCollection.find().toArray();
  res.status(200).send(result);
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

const updateMany = async (req, res) => {
  try {
    const result = await ticketsCollection.updateMany(
      { from: 'Dhaka' },
      {
        $set: {
          featured: true,
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

module.exports = { getAllTickets, updateMany, getFeaturedTickets };
