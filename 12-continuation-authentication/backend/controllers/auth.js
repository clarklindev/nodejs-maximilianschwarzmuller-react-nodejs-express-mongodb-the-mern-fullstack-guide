const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password } = req.body;

  //use mongodb
  let existingUser;
  try {
    //try find if user exists (findOne uses criteria to match... here by email)
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'user exists already, please login instead',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); //12 is the salt
  } catch (err) {
    const error = new HttpError('Could not create user, please try again', 500);
    return next(error);
  }

  const createdUser = new User({
    id: uuid(),
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('signing up failed, please try again', 500);
    return next(error);
  }

  // after successful creating of user, create a token
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email }, //payload: cant be, string, object or buffer
      process.env.JWT_ENCODING_STRING, //private key
      { expiresIn: '1h' }
    ); //assign data - inputs are payload : string, object or buffer
  } catch (err) {
    const error = new HttpError('signing up failed, please try again', 500);
    return next(error);
  }

  // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  //use mongodb
  let existingUser;

  //validate email
  try {
    //try find if user exists (findOne uses criteria to match... here by email)
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later',
      500
    );

    return next(error);
  }

  //check if email/password is in database and correct
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      403
    );
    return next(error);
  }

  //check password
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      403
    );
    return next(error);
  }

  //generate token

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email }, //payload is data you want to encode into token: string, object or buffer
      process.env.JWT_ENCODING_STRING, //private key
      { expiresIn: '1h' }
    ); //assign data - inputs are payload : string, object or buffer
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again', 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  }); //returns to frontend

  // res.json({
  //   message: 'Logged in!',
  //   user: existingUser.toObject({ getters: true }),
  // });
};

exports.signup = signup;
exports.login = login;
