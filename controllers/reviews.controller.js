const { ObjectId } = require('mongodb');
const { db } = require('../config/db.js');
const reviewsCollection = db.collection('reviews');

const insertReview = async (req, res) => {
  try {
    const review = req.body;
    const result = await reviewsCollection.insertOne(review);
    res.send({
      insertedId: result.insertedId,
      review: review,
    });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
};

const getMyReviews = async (req, res) => {
  console.log(req.query);
  try {
    const { email, bookingId } = req.query;
    const query = { userEmail: email };
    if (bookingId) {
      query.bookingId = bookingId;
    }
    console.log(query);
    const result = await reviewsCollection.find(query).toArray();
    res.status(200).send(result || null);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

// for home page testimonials
const getReviews = async (req, res) => {
  try {
    const result = await reviewsCollection.find({ isDisplay: true }).toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const result = await reviewsCollection.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

// set review as display by admin , protected
const manageReview = async (req, res) => {
  const id = req.params;
  const { currentStatus } = req.body;
  try {
    if (currentStatus === true) {
      const currentCount = await reviewsCollection.countDocuments({
        isDisplay: true,
      });
      if (currentCount >= 6) {
        return res.status(400).json({
          success: false,
          message: 'Limit Reached: You can only show up to 6 reviews. ',
        });
      }
    }

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        isDisplay: currentStatus,
      },
    };

    const result = await reviewsCollection.updateOne(filter, updateDoc);

    res.status(200).send({
      success: true,
      message: currentStatus
        ? 'Review is now Display in Home.'
        : 'Review removed from Home.',
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const id = req.params;
    const filter = { _id: new ObjectId(id) };
    const result = await reviewsCollection.deleteOne(filter);
    res.status(200).send({
      success: true,
      message: 'Review deleted successfully.',
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  insertReview,
  getMyReviews,
  getReviews,
  getAllReviews,
  manageReview,
  deleteReview,
};
