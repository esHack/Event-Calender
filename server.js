// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');

// configure app to use bodyParser()
// this will let us get the data from a POST

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

var mongoose = require('mongoose');

var db = mongoose.connection;

var Schema = mongoose.Schema;
var eventSchema = new Schema({
id : Number,
title:String,
description:String,
address : String,
zip : String,
category : String,
startDate:Date,
endDate:Date,
latitude:String,
longitude:String,
country:String,
rsvp:Boolean
});

var Event = mongoose.model('Event', eventSchema);

mongoose.connect('mongodb://esh:pass@ds011734.mlab.com:11734/esh');


 db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  console.log('opened');
});



var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	console.log('request is -->'+ req.body.country);
    //res.json({ message: 'hooray! welcome to our api!' });
    
   
	res.sendfile('./public/index.html');
});

app.get('/login', function(req, res) {
	console.log('request on login -->'+req.url);
		res.sendfile('./public/login.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
	
app.post('/admin', function(req, res) {
	console.log('request on admin -->'+req.url);
		res.sendfile('./public/admin.html'); // load the single view file (angular will handle the page changes on the front-end)
	});



app.post('/send', function(request, response) {
	console.log('request on send -->'+request.url);

  var url = request.url;
  var body = [];
  var resp="";
 
  request.on('error', function(err) {
    console.error(err);
  }).on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
    console.log("resquest from modal " +body+"");
    resp+=body;
    console.log(resp);

    var obj=JSON.parse(resp);


var test = new Event(obj);

Event.findOne({id: obj.id}, function (err, event) {
        if(!event){

        	test.save(function (err, data) {
if (err) console.log(err);
else{ console.log('Saved ', data );
 response.send('success');}
});
        }else{

        	Event.findOneAndRemove({id: obj.id}, function(err, data) {
  //var newFieldsData = new mongoDBCollectionObject(fieldsdata); //-- fieldsdata updated data
  test.save(function(err, data) { // save document to that collection with updated data
    if (err) {
      console.log(err);
    } else
        {response.send('success');
    }
    });
  })
        	
        }

    });
 

  });

 
 
});




app.get('/getEventsCatA', function(request, response) {
	console.log('request on getEvents -->'+request.url);

var searchQuery = {category: 'CAT A'};
Event.find(searchQuery, function (err, events) {
        response.json(events);
    });
});

app.get('/getEventsCatB', function(request, response) {
	console.log('request on getEvents -->'+request.url);

var searchQuery = {category: 'CAT B'};
Event.find(searchQuery, function (err, events) {
        response.json(events);
    });
});

app.get('/getEvents', function(request, response) {
	console.log('request on getEvents -->'+request.url);

var searchQuery = {};
Event.find({}).sort('id').exec(function (err, events) {
        response.json(events);
    });
});

app.post('/updateIds', function(request, response) {
	console.log('request on getEvents -->'+request.url);
	
	var url = request.url;
  var body = [];
  var resp="";
 
  request.on('error', function(err) {
    console.error(err);
  }).on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
    console.log("resquest from modal " +body+"");
    resp+=body;
    console.log(resp);
    var obj=JSON.parse(resp);
    console.log(obj.old);


    var event1 ;
	var event2 ;

Event.findOne({id: obj.old}, function(err, event) {  
		   
           event.id=obj.new;


           Event.findOne({id: obj.new}, function(err, event1) { 
           console.log(event1);
           //event2=new Event(event);
           event1.id=obj.old;

           event1.save(function(err) {
            if(!err) {
                console.log("contact " + event1.id);
                event.save();
                response.send('success');
            }
            else {
                console.log("Error: could not save contact " + event1.id);
            }
        });

});

           
});



 });
    
	
});



app.post('/delete', function(request, response) {
	console.log('request on delete -->'+request.url);

  var url = request.url;
  var body = [];
  var resp="";
 
  request.on('error', function(err) {
    console.error(err);
  }).on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
    console.log("resquest from modal " +body+"");
    resp+=body;
    console.log(resp);

    var obj=JSON.parse(resp);


var test = new Event(obj);
console.log(obj.id);


Event.remove({id:obj.id},function(err, result){
    if ( err ) throw err;
    else{
    console.log("Find Operations: " + result);
    Event.find({id : {$gt:obj.id}}, function(err, events){
    if ( err ) throw err;
    else{
    console.log("Find Operations: " + events);

    for (var i = 0; i < events.length; i++) {
           var model = events[i];
           console.log(model.id);
           var x= (model.id)-1;
           console.log(x);
           model.id=x;
           model.save(function(err) {
      if (err) throw err;
      console.log(model);
    });


    }
    response.send('success');
    }

  });

    }
  });



  });

 
 
});



app.get('/rsvp', function(request, response) {
	console.log('request on rsvp -->'+request.url);
	console.log(request.query.rsvpId);
	Event.findOne({id :request.query.rsvpId}, function(err, events){
    if ( err ) throw err;
    else{
    console.log("Find Event: " + events);
    events.rsvp=true;
    events.save(function(err) {
      if (err) throw err;
      console.log(events);
    });
    response.send('disable');
    }

  });
});



process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);