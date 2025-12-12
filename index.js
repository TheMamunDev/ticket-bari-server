require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');
const admin = require('firebase-admin');

const app = express();

if (!admin.apps.length) {
  if (!process.env.FIREBASE_ADMIN) {
    console.error('FIREBASE_ADMIN env var missing!');
  } else {
    const decoded = Buffer.from(process.env.FIREBASE_ADMIN, 'base64').toString(
      'utf8'
    );
    const serviceAccount = JSON.parse(decoded);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

app.use(cors());

app.use(express.json());

connectDB()
  .then(() => console.log('DB Connected'))
  .catch(err => console.error(err));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('TicketBari Server is Running');
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running at ${port}`));
}
