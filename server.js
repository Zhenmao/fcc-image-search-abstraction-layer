// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var request = require('request');
var querystring = require('querystring');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Unsplash API Application ID
var APPLICATION_ID = process.env.APPLICATION_ID;
var BASE_UNSPLASH_URL = "https://api.unsplash.com/search/photos";

// Database setup
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
mongoose.connect(MONGODB_URI, {useMongoClient: true});

var searchHistorySchema = new mongoose.Schema({
  term: { type: String, required: true },
  when: { type: Date, default: Date.now }
});

var SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

// http://expressjs.com/en/starter/static-files.html
app.use('/public', express.static(__dirname + '/public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Search route
app.get("/api/imagesearch/:search_term", function(req, res, next) {
  var searchTerm = req.params.search_term;
  var offset = req.query.hasOwnProperty("offset") ? parseInt(req.query.offset) : 0;
  
  // Add search term to search history collection
  SearchHistory.create({ term: searchTerm }, function(err, searchTerm) {
    if (err) return next(err);
    console.log(searchTerm);
  })
  
  // Prepare for request for unsplash api
  var queryObj = {
    client_id: APPLICATION_ID,
    query: searchTerm,
    page: offset + 1
  };
  var options = {
    url: BASE_UNSPLASH_URL + "?" + querystring.stringify(queryObj),
    headers: {
      "Accept-Version": "v1"
    }
  };
  
  // Request for unsplash api
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var images = [];
      var results = JSON.parse(body).results;
      
      // Build response json
      results.forEach(function(result) {
        var imageURL = result.links.download;
        var altText = result.description;
        var pageURL = result.links.html;
        images.push({
          imageURL: imageURL,
          altText: altText,
          pageURL: pageURL
        })
      });
      res.json(images);
      
    } else {
      next(error);
    }
  });
})

// Search history route
app.get("/api/latest/imagesearch", function(req, res) {
  SearchHistory.find({}, {_id: false, __v: false}, {limit: 20}).lean().exec(function(err, searchHistories) {
    res.json(searchHistories);
  });
});

// Other routes
app.get("*", function(req, res) {
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

// Listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

