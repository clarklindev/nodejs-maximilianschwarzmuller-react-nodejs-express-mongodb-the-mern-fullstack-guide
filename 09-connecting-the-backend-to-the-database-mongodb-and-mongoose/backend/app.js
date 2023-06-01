const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

//app.use(bodyParser.urlencoded({ extended: false })); //parse incoming request, urlencoded data in body will be extracted
app.use(bodyParser.json()); //get data from form - by parsing the body of the request //parse incoming requests for json data

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

//if route not found (from previous middleware)
app.use((req, res, next) => {
  const err = new HttpError('could not find route', 404);
  throw err;
});

// handler for all previous middleware yielding errors
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error); //forward the error
  }

  //here no response has been set yet
  res.status(error.code || 500);
  res.json({ message: error.message || 'an unknown error occured' });
});

mongoose
  .connect(
    'mongodb://clarkcookie:nIDzHuV6bO0QXVer@ac-hxcxvdr-shard-00-00.517767p.mongodb.net:27017,ac-hxcxvdr-shard-00-01.517767p.mongodb.net:27017,ac-hxcxvdr-shard-00-02.517767p.mongodb.net:27017/?ssl=true&replicaSet=atlas-stbdax-shard-0&authSource=admin&retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log('err: ', err);
  });
