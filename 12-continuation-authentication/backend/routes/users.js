const express = require('express');
const usersController = require('../controllers/users');

const router = express.Router();

router.get('/', usersController.getUsers);
router.get('/:uid/places', usersController.getPlacesByUserId);

module.exports = router;
