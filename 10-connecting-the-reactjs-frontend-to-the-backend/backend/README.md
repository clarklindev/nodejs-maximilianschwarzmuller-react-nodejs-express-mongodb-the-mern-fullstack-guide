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
