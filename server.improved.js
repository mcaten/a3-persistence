const express = require( 'express' ),
      mongodb = require( 'mongodb' ),
      cookie  = require( 'cookie-session' ),
      bodyParser = require("body-parser"),
      app = express()

app.use( express.static('public') )
app.use( express.json() )
const path = require('path');

// use express.urlencoded to get data sent by defaut form actions
// or GET requests
app.use( express.urlencoded({ extended:true }) )

// cookie middleware! The keys are used for encryption and should be
// changed
app.use( cookie({
  name: 'session',
  keys: ['secretkey', 'cookiekey']
}))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.get('/index.html', function(req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/login.html', function(req, res) {
  res.sendFile(path.join(__dirname, '/views/login.html'));
});

// make sure to substitute your username / password for tester:tester123 below!!! 
const uri = "mongodb+srv://testUser:testing123@cluster0.gieka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new mongodb.MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology:true })
let collection = null
let schema = mongodb.s

client.connect()
  .then( () => {
    // will only create collection if it doesn't exist
    return client.db( 'datatest' ).collection( 'test' )
  })
  .then( __collection => {
    // store reference to collection
    collection = __collection
    console.log(collection)
    // blank query returns all documents
    return collection.find({ }).toArray()
  })
  .then( console.log )
  
// // route to get all docs
// app.get( '/', (req,res) => {
//   if( collection !== null ) {
//     debugger
//     collection.find({ }).toArray().then( result => res.json( result ) )
//   }
// })

app.post( '/add', (req,res) => {
  // assumes only one object to insert
  req.body['username'] = user
  collection.insertOne( req.body )
  .then( insertResponse => collection.findOne(insertResponse.insertedId) )
  .then( findResponse => res.json( findResponse))
})

app.get('/data', (req, res) => {
  if (collection !== null) {
    collection.find({ }).toArray().then(result => res.json(result));
  }
});

const client2 = new mongodb.MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology:true })
let loginCollection = null;
client2.connect()
  .then( () => {
    // will only create collection if it doesn't exist
    return client2.db( 'testdata' ).collection( 'users' )
  })
  .then( __collection => {
    // store reference to collection
    loginCollection = __collection
    loginCollection.createIndex({"username": 1}, {unique: true})
    
  })
  //.then( console.log )


let user = null;

//loginCollection.createIndex({"username": 1}, {unique: true})
app.post("/login", bodyParser.json(), function(req, res) {
  loginCollection
    .find({ username: req.body.username, password: req.body.password })
    .toArray()
    .then(result => res.json(result));
  user = req.body.username;
});

app.post("/create", bodyParser.json(), function(req, res) {
  user = req.body.username;
  loginCollection.insertOne( req.body )
  .then( insertResponse => collection.findOne(insertResponse.insertedId) )
  .then( findResponse => res.json( findResponse))
  .catch(err => {
    res.status(500).json()
  }) 
  
});


  
app.listen( 3000 )
