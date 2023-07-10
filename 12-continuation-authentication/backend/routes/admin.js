const express = require('express');
const { check } = require('express-validator');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/key', adminController.getKey);

module.exports = router;
