require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

if (!admin.apps.length) {
  const decoded = Buffer.from(process.env.FIREBASE_ADMIN, 'base64').toString(
    'utf8'
  );
  const serviceAccount = JSON.parse(decoded);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Database connection error');
  }
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('TicketBari Server is Running');
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`TicketBari server running at ${port}`);
  });
}
