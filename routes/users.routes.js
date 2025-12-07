const express = require('express');
const router = express.Router();
const { getUser, insertUser } = require('../controllers/users.controller.js');

router.get('/', getUser);
router.post('/', insertUser);

module.exports = router;
