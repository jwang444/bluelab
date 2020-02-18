const pug = require('pug');

const express = require('express');
const app = express();

var bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var http = require('http').Server(app);
var io = require('socket.io')(http);

var dbLat, dbLong, isopenJS;

io.on('connection', function (socket) {
  console.log('an user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

// replace the uri string with your connection string.
const uri = "mongodb+srv://richung:chung123@cluster0-cbqo5.mongodb.net/test?retryWrites=true"
MongoClient.connect(uri, function(err, client) {
   if(err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
   }
   console.log('Connected...');
   const collection = client.db("MapData").collection("LatLong");
   // perform actions on the collection object
   collection.findOne({_id: ObjectId("5ccb81a49d19e8157869c835")}, (err, item) => {
      dbLat = item.lat;
      dbLong = item.long;
      //console.log(dbLat + dbLong);
   });
   collection.findOne({_id: ObjectId("5ccdd055906ac54930bdef47")}, (err, item) => {
      isopenJS = item.isopen;
   });
   client.close();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'pug');

app.get('/', function(req, res){
  var data = {
    id: '1234',
    LL: {
      lat: dbLat,
      long: dbLong,
    },
    initstatesJS: isopenJS,
  };

  res.render('template', {workflowData_server: JSON.stringify(data)});

});

app.post('/buttsub', function(req,res){

  // io.on('connection', function (socket) {
  //  console.log('a-pizza a-pie-a');
  // });

  //first, we need to update isopenJS, which is supposed to act as a local copy of the isopen array
  //we obtain the index from req.body.butt and subtract 1 because indexing lmfao
  //then we loop through isopenJS, and once we reach the index, we check if the state is true or false
  //depending on which one, we swap it to be opposite
  for(i = 0; i < 11; i++){
    if(i== (parseInt(req.body.butt)-1)){
      console.log("passed");
      if(!isopenJS[i]){
        console.log("changed from false to true");
        isopenJS[i] = true;
      }
      else{
        isopenJS[i] = false;
        console.log("changed from true to false");
      }
    }
  }


  // for(i = 0; i < 11; i++){
 //       //LOGGING IS OPEN JS, NOT LOGGING MONGO
 //       console.log(isopenJS[i]);
 //     }

 //we use mongo do connect to ultimately connect to the isopen array and edit it
  MongoClient.connect(uri, function(err, client) {
    if(err) {
          console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
      }
      console.log('Connected to mongo');
      const collection = client.db("MapData").collection("LatLong");
      // perform actions on the collection object
      collection.updateOne({_id: ObjectId("5ccdd055906ac54930bdef47")}, {'$set': {isopen: isopenJS}}, (err, item) => {
        console.log("changed in mongo");
      });
      client.close();
  });

  //dunno if the rest of this stuff is necessary, but might want to re-render the page again
  var data = {
    id: '1234',
    LL: {
      lat: dbLat,
      long: dbLong,
    },
    initstatesJS: isopenJS,
  };

  //res.render('template', {workflowData_server: JSON.stringify(data)});
  res.redirect('/');


});

//app.listen(3000, function () {
http.listen(3000, function () {
  console.log('listening on port 3000!');
});



//mongodb+srv://richung:<password>@cluster0-cbqo5.mongodb.net/test?retryWrites=true