const { db } = require('../config/db.js');
const usersCollection = db.collection('users');
const bcrypt = require('bcrypt');

const getUser = async (req, res) => {
  const query = {};
  const email = req.query.email;
  if (email) {
    query.email = email;
  }
  const result = await usersCollection.findOne(query);
  res.status(200).send(result);
};

const insertUser = async (req, res) => {
  try {
    const user = req.body;
    const pass = user.password;
    user.password = await bcrypt.hash(pass, 6);
    const newUser = {
      ...user,
      createdAt: new Date(),
      role: 'user',
    };
    const result = await usersCollection.insertOne(newUser);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getUser,
  insertUser,
};
