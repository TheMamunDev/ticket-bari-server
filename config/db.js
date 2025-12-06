const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.q9crcyr.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log('You successfully connected to MongoDB!');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

const db = client.db('ticketbari');

module.exports = { connectDB, db };
