const express = require('express')
var cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.caivj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("carDoctor");
    const serviceCollection = database.collection("services");
    const bookingCollection = database.collection("booking");
 
    //Services Collection
    //Get all data
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //Get individual data
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })



    //Bookings collection

    //Get for some documents (Not one or multiple documents) documents
    app.get('/bookings', async (req, res) => {
      //console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })


    //post
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })
    
    //patch
   app.put('/bookings/:id',async(req,res)=>{
    const id = req.params.id;
    const updateBooking = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        status: updateBooking.status
      },
    };
    const result = await bookingCollection.updateOne(filter, updateDoc,options);
    res.send(result);
   })

    //Delete
    app.delete('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('car-doctor server is going on..!!!')
})

app.listen(port, () => {
  console.log(`The port number is: ${port}`)
})