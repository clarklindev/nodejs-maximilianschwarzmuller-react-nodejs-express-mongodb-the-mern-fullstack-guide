const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTION') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1]; //Authorization returns:     Authorization : "Bearer <TOKEN>"
    if (!token) {
      throw new Error('Authentication failed!');
    }

    //verify token
    const decodedToken = jwt.verify(token, process.env.JWT_ENCODING_STRING); //verify(token, private key)

    //add dynamic data to request
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed', 403);
    return next(error);
  }
};
