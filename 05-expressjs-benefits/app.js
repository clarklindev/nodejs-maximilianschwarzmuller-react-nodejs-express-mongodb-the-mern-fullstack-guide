const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

//app.use(bodyParser.json()); //parse incoming requests for json data
//app.use(bodyParser.urlencoded({ extended: false })); //parse incoming request, urlencoded data in body will be extracted

//get data from form - by parsing the body of the request
app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use(usersRoutes);

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

// app.post('/user', (req, res, next) => {
//   res.send(`<h1> ${req.body.username} </h1>`);
// });

// app.get('/', (req, res, next) => {
//   res.send(`<form method="POST">
//     <input type="text" name="username">
//     <button type="submit">create user</button>
//   </form>`);
// });

app.listen(5000);
