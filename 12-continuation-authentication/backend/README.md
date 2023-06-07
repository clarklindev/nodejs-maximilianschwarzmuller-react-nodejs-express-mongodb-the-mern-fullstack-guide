# nodejs

### Benefits of expressJS

- body-parser replaces need for parsing incoming data
- allows json like access to parsed data from form
- app.use() - for all incoming requests
- app.post() - for post requests
- app.get() - for get requests

- bodyParser creates req.body
- app.use(bodyParser.json()); //parse incoming requests for json data
- app.use(bodyParser.urlencoded({ extended: false })); //parse incoming request, urlencoded data in body will be extracted

## Error handling (async vs non-async)

- async request/error handling should return next(error)
- throw new HttpError('something',422) can be used for non-async

## Sessions and transactions

- use Session: carry out multiple operations, if one fails, both operations aborted..
- for transactions, collections have to be created manually

```js
//use Session: carry out multiple operations, if one fails, both operations aborted..
const sess = await mongoose.startSession();
sess.startTransaction();
await createdPlace.save({ session: sess });
user.places.push(createdPlace); //push is mongoose adding ONLY id of the place
await user.save({ session: sess });
await sess.commitTransaction(); //only at this point is changes committed to db, if anything went wrong, a rollback happens
```

## mongoose populate()

- allows us to reference a document in another collection and work with data in that document of that collection
- NB: you can only use .populate() if the connection of schemas was established.
- .populate('creator') from current collection, use this property "creator" which has the userId and refer a document stored in another collection
  and searches through the data

## URLSearchParams

- can create param key and values using URLSearchParams({})

```js
const params = new URLSearchParams({ [API_KEY_NAME]: API_KEY_VALUE });
```

## URL params

if you use postman and add query string params like: 'localhost:5000/api/places/map?lat=0.444&lng=9.3&zoom=16'

- you get access to this

```js
const url = require('url');

console.log(url.parse(req.url, true).query);

// or access them like this...
const latParams = req.query.lat;
const lngParams = req.query.lng;
const zoomParams = req.query.zoom;
```

## URL params (another option ONLY WHEN WORKING WITH <Route> Component)

- useParams is a hook that allows you to access and retrieve URL parameters in your components.
- URL parameters are dynamic segments within a URL that can be used to pass data or identify specific resources. For example, in the URL path /users/:id, the :id portion is a URL parameter that can represent a unique identifier for a user.
- if the current URL matches the route /users/:id (e.g., /users/123), the useParams hook will provide an object with a property named id, which holds the corresponding value (123 in this case). You can then use this value to fetch data or render content specific to that user.
- Note that useParams can only be used within a component that is rendered within a <Route> component provided by the React Router library. It won't work outside of routing-related components.

```js
// eg. route is /users/:id

import { useParams } from 'react-router-dom';

const { id } = useParams(); //id is '123'
```

<!-- ------------------------------------------------------------------------------------------------ -->
<!-- ------------------------------------------------------------------------------------------------ -->

## Authentication

- encrypting passwords uaing bcryptjs

```
npm i bcryptjs

```

### signup

- hash password using bcrypt.hash()
- store hashed password in db

```js
// users-controller.js
//signUp()

...

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
```

### login - authentication check

- check password vs encrypted stored password on server with bcrypt.compare()

```js
const login = async (req, res, next) => {

...

  existingUser = await User.findOne({ email: email });

...

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
      401
    );
    return next(error);
  }

...

};
```

### signup(create User) - then create a token

- after creating user, creates a JWT token

### token (JWT)

- string generated with private key and algorithm
- then can encode data into string
- can decode token to find data inside
- jsonwebtoken (allows generating tokens with private key)

```
npm i jsonwebtoken
```

```js
// user-controller.js
const jwt = require('jsonwebtoken');

let token;
try {
  token = jwt.sign(
    { userId: createdUser.id, email: createdUser.email }, //payload: cant be, string, object or buffer
    process.env.JWT_PRIVATE_KEY, //private key
    { expiresIn: '1h' }
  ); //assign data - inputs are payload : string, object or buffer
} catch (err) {
  const error = new HttpError('signing up failed, please try again', 500);
  return next(error);
}
// res.status(201).json({ user: createdUser.toObject({ getters: true }) });   //send back who createdUser object
res
  .status(201)
  .json({ userId: createdUser.id, email: createdUser.email, token: token }); //select what to send back (include token)
```

### restrict access to routes and using the token

- to restrict access to routes, you can add middleware before routes - requests travel through routes/middleware top-to-bottom (routes are executed in order),
- so by placing middleware before the routes that require user to be authenticated (need a valid token) - that can ensure that the routes need a valid token to be viewed, access can be controlled
- routes before the middleware are all accessible.

- returns Authorization: "Bearer TOKEN" (there is a "Bearer" string prepending)
- you can get token from req.headers (provided by express js), which has key/value pairs where key is the header and value is the values
- eg. authorization (which is available because we set cors headers - see below)

```js
//backend app.js
res.setHeader(
  'Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept, Authorization' //note these are all case insensative
);
```

```js
// check-auth.js
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]; //Authorization returns : "Bearer <TOKEN>"
  try {
    if (!token) {
      throw new Error('Authentication failed!'); //meaning no token exists
    }

    //verify token
    const decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY); //verify(token, private key)

    //returns object - that we add userData prop to
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed', 401);
    return next(error);
  }
};
```

### using check-auth.js

```js
// places-routes.js
const checkAuth = require('../middleware/check-auth');

//add middleware to ensure token exists
router.use(checkAuth);
```

### tricky

- method on req becomes OPTIONS (https://www.udemy.com/course/react-nodejs-express-mongodb-the-mern-fullstack-guide/learn/lecture/16916212#overview)
- add to check-auth.js

```js
// check-auth.js

if (req.method === 'OPTIONS') {
  return next();
}
```
