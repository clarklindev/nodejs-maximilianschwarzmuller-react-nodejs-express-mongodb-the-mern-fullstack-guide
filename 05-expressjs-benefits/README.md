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
