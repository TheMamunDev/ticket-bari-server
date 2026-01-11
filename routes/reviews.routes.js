const express = require('express');
const router = express.Router();
const {
  insertReview,
  getMyReviews,
  getReviews,
  getAllReviews,
  manageReview,
  deleteReview,
} = require('../controllers/reviews.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyAdmin } = require('../middlewares/admin/middlewares.js');

router.post('/', verifyToken, insertReview);
router.get('/reviews', getMyReviews);
router.get('/', getReviews);
router.get('/all', verifyToken, verifyAdmin, getAllReviews);
router.patch('/:id', verifyToken, verifyAdmin, manageReview);
router.delete('/:id', verifyToken, verifyAdmin, deleteReview);

module.exports = router;
