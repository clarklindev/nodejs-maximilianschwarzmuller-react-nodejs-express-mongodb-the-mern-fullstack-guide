const fs = require('fs');

const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const { getCoordsForAddress } = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place',
      500
    );
    return next(error);
  }

  if (!place) {
    //async code have to use next()
    const error = new HttpError(
      'Could not find a place for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); //getters:true tells mongoose to adds an id to every document returning id as a string - getters are usually lost with .toObject() call - but with getters:true - to return id without underscore in _id
};

const getAllPlaces = async (req, res, next) => {
  let places;

  try {
    places = await Place.find({});
  } catch (err) {
    const error = new HttpError(
      'something went wrong, could not find places',
      500
    );
    return next(error);
  }

  if (!places) {
    const error = new HttpError('could not find any places', 404);
    return next(error);
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
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

  const { title, description, address } = req.body; //can pass this data in from postman

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.log('something went wrong: ', error);
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  //check if user already exists
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  //if it doesnt exist
  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  try {
    //use Session: to carry out transactions (multiple operations), if one fails, both operations aborted..
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPlace.save({ session: sess }); //save as part of session
    //make sure place id is also added to user
    user.places.push(createdPlace); //push is mongoose adding ONLY id of the place
    await user.save({ session: sess }); //save as part of session
    await sess.commitTransaction(); //only at this point is changes committed to db, if anything went wrong, a rollback happens
  } catch (err) {
    const error = new HttpError('creating place failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body; //can pass this data in from postman
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('you are not allowed to edit this place', 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    //trying to find the placeID of a place we are looking for - to delete this place.
    //But at the same time we also want to search for our users collection and see which user has this place.
    //And then we want to make sure that if we delete the place that this ID is also deleted from this user document.

    // This means we need access to a user document and we need to overwrite or change any existing information in this document.
    // And to do so we can use these so called populate() method here. Populate allows us to exactly do that.
    // So to refer to a document stored in another collection and to work with data in that existing document of that other collection.

    //And the populate method needs one additional information. It needs within this document to refer to a specific property (which refs the other document to make this relation)

    //which will give information about the document where we want to change something..

    //In our case, this is the 'creator' property because this property contains the user ID.
    //Mongoose then takes this id but searches through the entire user data.
    //So the ID allows us to search for the user and then to get back all the data stored in a user document

    place = await Place.findById(placeId).populate('creator', '-password');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id', 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'you are not allowed to delete this place',
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    // await place.deleteOne(); //note .remove() is deprecated

    //use a session
    const sess = await mongoose.startSession();
    sess.startTransaction();
    // await place.remove({ session: sess }); //.remove() is depricated
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place); //removes place from user.
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place',
      500
    );
    return next(error);
  }

  //delete associated image for place
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: `deleted:${placeId}` });
};

exports.getAllPlaces = getAllPlaces;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
