const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;
require('dotenv').config();
const admin = require("firebase-admin");
const serviceAccount = require(__dirname+"/serviceaccount.json");


const app = express();
// app.use(cors())

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-e5d98.firebaseio.com"
});
app.get('/',(req, res)=> {
  res.send('Hello World')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.koqo3.mongodb.net/volunteer-network?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const allTasksCollection = client.db("volunteer-network").collection("alltasks");
  const allRegistriedTasksCollection = client.db("volunteer-network").collection("all-registried-tasks");

  app.get('/allTasks', (req,res)=>{
    allTasksCollection.find({})
    .toArray((error, documents)=>{
      res.send(documents)
    })
  })

  app.get('/all-registered-events',(req,res)=>{
    const token=req.headers.authorization;

    if(token && token.startsWith('Bearer')){
      const idToken=token.split(' ')[1];
     
      admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        let uid = decodedToken.uid;
        allRegistriedTasksCollection.find({})
        .toArray((error,documents)=>{
          res.send(documents)
          
        })
      })
    }
  })

  app.get('/my-events',(req,res)=>{
    const token=req.headers.authorization;

    if(token && token.startsWith('Bearer')){
      const idToken=token.split(' ')[1];
     
      admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        let uid = decodedToken.uid;

        allRegistriedTasksCollection.find({email:req.query.email})
        .toArray((error,documents)=>{
          res.send(documents)
        })
      })  

    }
  
  })

    app.post('/taskRegister',(req,res)=>{
      allRegistriedTasksCollection.insertOne(req.body)
      .then(result=>{
        res.send(result.insertedCount>0)
      })
    })

    app.post('/add-event',(req,res)=>{
      allTasksCollection.insertOne(req.body)
      .then(result=>{
        res.send(result.insertedCount>0)
      })
    })

    app.delete('/delete-event',(req,res)=>{
      allRegistriedTasksCollection.deleteOne({_id:ObjectID(req.body.id)})
      .then(result=>{
        res.send(result.deletedCount>0)
      })
    })

    app.delete('/cancel-event',(req,res)=>{
      allRegistriedTasksCollection.deleteOne({_id:objectId(req.body.id)})
      .then(result=>{
        res.send(result.deletedCount>0)
      })
    })
  
});

app.listen(process.env.PORT ||5000)
