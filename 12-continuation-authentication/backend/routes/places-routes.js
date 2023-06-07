const express = require('express');
const { check } = require('express-validator');
const placesController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/user/:uid', placesController.getPlacesByUserId);
router.get('/:pid', placesController.getPlaceById);
router.get('/', placesController.getAllPlaces);

//add middleware to ensure token exists to access routes after this middles
router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'), //get the posted image that comes with creating a new post
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesController.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
