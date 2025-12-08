const { db } = require('../config/db.js');
const paymentsCollection = db.collection('payments');

const getPayments = async (req, res) => {
  try {
    const email = req.params.email;
    const query = { userEmail: { $regex: email, $options: 'i' } };
    const result = await paymentsCollection.find(query).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getPayments };
