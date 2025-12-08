const { db } = require('../config/db.js');
const usersCollection = db.collection('users');

const getUser = async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email: email });
  res.status(200).send(result);
};

const getUserRole = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    res.status(200).send({ role: user.role });
  } catch (error) {
    console.log(error);
  }
};

const insertUser = async (req, res) => {
  try {
    const user = req.body;
    const newUser = {
      ...user,
      joinDate: new Date(),
      role: 'user',
    };
    const result = await usersCollection.insertOne(newUser);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const email = req.params.email;
    if (email !== req?.decoded_email) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    const user = req.body;
    const filter = { email: email };
    const option = { upsert: true };
    const updateDoc = { $set: { ...user, updatedAt: new Date() } };
    const result = await usersCollection.updateOne(filter, updateDoc, option);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to update user' });
  }
};
module.exports = {
  getUser,
  insertUser,
  getUserRole,
  updateUser,
};
