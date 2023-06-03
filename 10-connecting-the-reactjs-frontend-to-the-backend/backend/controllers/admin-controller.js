const mongoose = require('mongoose');

const getKey = (req, res, next) => {
  if (!process.env.API_KEY || process.env.API_KEY.length === 0) {
    throw new Error('You forgot to set API_KEY in .env file');
  }

  res.json({ key: process.env.API_KEY });
};

module.exports.getKey = getKey;
