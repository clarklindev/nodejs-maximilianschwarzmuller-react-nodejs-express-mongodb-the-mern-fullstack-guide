const HttpError = require('../models/http-error');
const { uuid } = require('uuidv4');
const { validationResult } = require('express-validator');
const { getCoordsForAddress } = require('../util/location');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'famous place in world',
    location: {
      lat: 40.748658991457205,
      lng: -73.98573131349158,
    },
    address: '20 W 34th St., New York, NY 10001, United States',
    creator: 'u1',
  },
];

const getPlaceById = (req, res, next) => {
  //use req.params. to read from url
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    // return res.status(404).json({message: 'could not find a place for the provided id.'});

    //async code have to use next()
    throw new HttpError('Could not find a place for the provided id.', 404);
  }

  res.json({ place });
};

const getAllPlaces = (req, res, next) => {
  console.log('getAllPlaces() function');
  console.log('DUMMY_PLACES: ', DUMMY_PLACES);
  res.json({ places: DUMMY_PLACES });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    // return res.status(404).json({message:" could not find a place for the provided user id"})
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('there are errors');
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //get data of form parsed with body parser

  const { title, description, address, creator } = req.body; //can pass this data in from postman

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.log('something went wrong: ', error);
    return next(error);
  }

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body; //can pass this data in from postman
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id.', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ deleted: placeId });
};

module.exports.updatePlace = updatePlace;
module.exports.deletePlace = deletePlace;
module.exports.createPlace = createPlace;
module.exports.getAllPlaces = getAllPlaces;
module.exports.getPlaceById = getPlaceById;
module.exports.getPlacesByUserId = getPlacesByUserId;
