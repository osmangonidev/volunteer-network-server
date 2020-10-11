const express=require('express')
const cors=require('cors')
const bodyParser=require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;
require('dotenv').config();

const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const uri = `mongodb+srv://mongodbuser:mongodbpassword@cluster0.koqo3.mongodb.net/volunteer-network?retryWrites=true&w=majority`;
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
        allRegistriedTasksCollection.find({})
        .toArray((error,documents)=>{
          res.send(documents)
        })
      .catch(function(error) {
        
      });
    // }
  })

  app.get('/my-events',(req,res)=>{
        allRegistriedTasksCollection.find({email:req.query.email})
        .toArray((error,documents)=>{
          res.send(documents)
        })
      .catch(function(error) {
        
      });
    // }
  
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

const port=5000||process.env.PORT;
app.listen(port,()=>console.log('app running on port 5000'))