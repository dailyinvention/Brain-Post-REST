// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var redis = require('redis');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('json spaces', 40);

var port = process.env.PORT || 8080;        // set our port

// CONNECT TO REDIS

var redis_client = redis.createClient();
redis_client.on('connect', function() {
    console.log('redis connected');
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Request received.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

//Get brain stats

router.route('/neurobrainget')
    .get(function(req, res) {
	objects= [];
    	redis_client.keys('*', function (err, keys) {
	    //res.json(keys);
	    var key, _i, _len, seen;
    	    seen = 0;
            for (_i = 0, _len = keys.length; _i < _len; _i++) {
		(function(i) {
      		     redis_client.hgetall(keys[i], function(err, obj) {
        	          objects.push({key:keys[i],obj});
        	          seen++;
        	          if (seen == _len) {
          	             return res.end(JSON.stringify(objects));
       		          }
      	    	     })
		})(_i)
		
    	    } 
	});     
    });
    

//Post brain stats

router.route('/neurobrainpost')

    .post(function(req, res) {
      var date = new Date();
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var date_string = year + '_' + month + '_' + day + '_' + hours + '_' + minutes + '_' + seconds;
      var attention = req.body.attention
      var meditation = req.body.meditation
      var delta = req.body.delta
      var theta = req.body.theta
      var alpha = req.body.alpha
      var beta = req.body.beta
      var gamma = req.body.gamma

      console.log("attention: " + attention)
      console.log("meditation: " + meditation)
      console.log("delta: " + delta)
      console.log("theta: " + theta)
      console.log("alpha: " + alpha)
      console.log("beta: " + beta)
      console.log("gamma:" + gamma)

      redis_client.hmset(["input:" + date_string,"attention",attention,"meditation",meditation,"delta",delta,"theta",theta,"alpha",alpha,"beta",beta,"gamma",gamma],function(error, result) 	  {
      	if (error)
            res.send(error);

        res.json({ message: 'Added instance.' });
        
      });	   
    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port); 
