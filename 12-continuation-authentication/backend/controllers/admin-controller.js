const mongoose = require('mongoose');

const getKey = (req, res, next) => {
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.length === 0) {
    throw new Error('You forgot to set GOOGLE_API_KEY in .env file');
  }

  res.json({ key: process.env.GOOGLE_API_KEY });
};

module.exports.getKey = getKey;
