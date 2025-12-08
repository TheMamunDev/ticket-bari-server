const express = require('express');
const router = express.Router();
const {
  getUser,
  insertUser,
  getUserRole,
  updateUser,
} = require('../controllers/users.controller.js');
const { verifyToken } = require('../middlewares/auth/middlewares.js');

router.get('/:email', getUser);
router.patch('/:email', verifyToken, updateUser);
router.get('/:email/role', getUserRole);
router.post('/', insertUser);

module.exports = router;
