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
