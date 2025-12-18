const { ObjectId } = require('mongodb');
const { db } = require('../config/db.js');
const usersCollection = db.collection('users');
const ticketsCollection = db.collection('tickets');

const getUser = async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email: email });
  res.status(200).send(result);
};

// get all users by admin , protected
const getAllUsers = async (req, res) => {
  try {
    const result = await usersCollection.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server error' });
  }
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

// update user
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

// update role by admin protected
const updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const data = req.body;
    const newData = {};
    if (data.user.role === 'admin') {
      const totalAdmins = await usersCollection.countDocuments({
        role: 'admin',
      });
      if (totalAdmins === 1 && data.status !== 'admin') {
        return res.status(409).json({
          message: 'You cannot remove this admin at this moment. ',
        });
      }
    }
    if (data.status === 'vendor') {
      newData.isFraud = false;
    }
    const updatedData = {
      $set: { ...newData, role: data.status },
    };
    const result = await usersCollection.updateOne(query, updatedData);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const markVendorAsFraud = async (req, res) => {
  const id = req.params;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  try {
    const updatedData = {
      $set: { isFraud: true },
    };
    const updatedUser = await usersCollection.updateOne(query, updatedData);
    const result = await ticketsCollection.updateMany(
      { vendorEmail: data.user.email },
      {
        $set: {
          status: 'rejected',
          isAdvertised: false,
          feedback: 'Vendor marked as Fraud by Admin',
        },
      }
    );
    res.status(200).send({ updatedUser: updatedUser, updateTicket: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports = {
  getUser,
  insertUser,
  getUserRole,
  updateUser,
  getAllUsers,
  updateRole,
  markVendorAsFraud,
};
