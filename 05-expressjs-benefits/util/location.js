const HttpError = require('../models/http-error');
require('dotenv').config();

const getCoordsForAddress = async (address) => {
  // const coords = {
  //   lat:40.7484474,
  //   lng:-73.987151
  // };
  // return coords;

  console.log('gets here...');
  console.log('process.env.API_KEY.length: ', process.env.API_KEY.length);
  if (!process.env.API_KEY || process.env.API_KEY.length === 0) {
    throw new Error('You forgot to set API_KEY in .env file');
  }

  //send request
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.API_KEY}`
  );

  console.log('response: ', response);
  //with fetch(), it returns a promise that resolves to a Response object.
  const data = await response.json(); //.json() extracts JSON data. with axios response data is directly on .data property of response object.

  console.log('data: ', data);

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for specified address',
      422
    );
    throw error;
  }

  const coords = data.results[0].geometry.location;
  console.log('data.results[0].geometry.location: ', coords);

  return coords;
};

module.exports.getCoordsForAddress = getCoordsForAddress;
