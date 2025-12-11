const express = require('express');
const router = express.Router();
const {
  getUser,
  insertUser,
  getUserRole,
  updateUser,
  getAllUsers,
  updateRole,
  markVendorAsFraud,
} = require('../controllers/users.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');
const { verifyAdmin } = require('../middlewares/admin/middlewares.js');

router.get('/:email', getUser);
router.get('/', getAllUsers);
router.patch('/:email', verifyToken, updateUser);
router.get('/:email/role', getUserRole);
router.post('/', insertUser);
router.patch('/role/:id', verifyToken, verifyAdmin, updateRole);
router.patch('/fraud/:id', verifyToken, verifyAdmin, markVendorAsFraud);

module.exports = router;
