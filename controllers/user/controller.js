const { db } = require('../../config/db');
const userCollection = db.collection('users');

const getAllUsers = async (req, res) => {
  const users = await userCollection.find().toArray();
  res.status(200).send(users);
};

const getUser = async (req, res) => {
  console.log(req.query);
  const query = {};
  if (req.query.email) {
    const email = req.query.email;
    query.email = email;
    console.log(query);
  }
  const users = await userCollection.findOne(query);
  res.status(200).send(users);
};

const createUser = async (req, res) => {
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.status(201).send(result);
};

module.exports = { getAllUsers, createUser, getUser };
