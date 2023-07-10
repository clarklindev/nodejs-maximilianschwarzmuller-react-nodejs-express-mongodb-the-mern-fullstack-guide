const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();
const fileUpload = require('../middleware/file-upload');

const validation = {
  validateSignup: [
    check('name').not().isEmpty(),
    check('email')
      .normalizeEmail({ gmail_remove_dots: false }) // Test@test.com => test@test.com
      .isEmail(),
    check('password').isLength({ min: 6 }),
  ],
};

router.post(
  '/signup',
  fileUpload.single('image'),
  validation.validateSignup,
  authController.signup
);

router.post('/login', authController.login);

module.exports = router;
