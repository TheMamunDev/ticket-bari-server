const { db } = require('../../config/db.js');
const usersCollection = db.collection('users');

const verifyVendor = async (req, res, next) => {
  const email = req.decoded_email;
  const query = { email };
  const user = await usersCollection.findOne(query);

  if (!user || user.role !== 'vendor') {
    return res.status(403).send({ message: 'forbidden access' });
  }

  next();
};
module.exports = {
  verifyVendor,
};
