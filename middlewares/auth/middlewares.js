const { db } = require('../../config/db');
const userCollection = db.collection('users');
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  // console.log(token);
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  try {
    const idToken = token.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.decoded_email = decoded.email;
    // console.log(decoded);
  } catch (err) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  next();
};

module.exports = {
  verifyToken,
};
