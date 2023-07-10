const express = require('express');
const { check } = require('express-validator');
const placesController = require('../controllers/places');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
router.get('/', placesController.getAllPlaces);
router.get('/:pid', placesController.getPlaceById);

//add middleware to ensure token exists to access routes after this middleware
router.use(checkAuth);

const validation = {
  validateCreate: [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],

  validateUpdate: [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
  ],
};

router.post(
  '/',
  fileUpload.single('image'), //get the posted image that comes with creating a new post
  validation.validateCreate,
  placesController.createPlace
);

router.patch('/:pid', validation.validateUpdate, placesController.updatePlace);
router.delete('/:pid', placesController.deletePlace);

module.exports = router;
