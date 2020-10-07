const expressSetup=require('express-setup'); // This is my own package.It simplifies the basic setup.
const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;
require('dotenv').config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceaccount.json");

const app=expressSetup.setup(5000)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-e5d98.firebaseio.com"
});


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
      }).catch(function(error) {
        
      });
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
      }).catch(function(error) {
        
      });
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
