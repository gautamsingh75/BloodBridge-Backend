
const express = require('express')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000
const cors = require('cors')
const { default: axios } = require('axios');
app.use(cors({
  origin: [
    'http://localhost:5173','https://bloodbridge-bloodbank.web.app','https://bloodbridge-bloodbank.firebaseapp.com'
  ],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uuibjb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    const userCollection = client.db('BloodBridgeDB').collection('users')
    const informationCollection = client.db('BloodBridgeDB').collection('information')
    const BloodGroupsCollection = client.db('BloodBridgeDB').collection('BloodGroups')

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser)
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    app.post('/information', async (req, res) => {
      const informations = req.body
      const result = await informationCollection.insertOne(informations)
      res.send(result)
    })

    app.get('/information', async (req, res) => {
      const result = await informationCollection.find().toArray();
      res.send(result)
    })

    // ------- Approving Donation Request Status --------
    app.patch('/information/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: 'approved'
        }
      }
      const result = await informationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    app.patch('/informationRej/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: 'rejected'
        }
      }
      const result = await informationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })


    // ------

    app.get("/information1/:email",async(req,res)=>{
      const email = req.params.email
      const query = { email: email };
      const existingUser = await informationCollection.find(query).toArray(); 
      res.send(existingUser)
   })

    // ---------- Donation Request -------
    app.get('/information/:email', async (req, res) => {
      const query = { email: req.params.email }
      // if (req.params.email !== req.decoded.email) {
      //     return res.status(403).send({ message: 'forbidden access' });
      // }
      const result = await informationCollection.find(query).toArray();
      res.send(result);
    })

    // ----- Blood Groups --------
    app.get("/bloodGroups", async (req, res) => {
      const result = await BloodGroupsCollection.find().toArray();
      res.send(result);
    });

    app.patch("/bloodGroups1", async (req, res) => {
      const { bloodgroup, Acc_quantity } = req.body;
      const query = { bloodGroup: bloodgroup };
      let amount = parseInt(Acc_quantity);
      // console.log(bloodgroup, Acc_quantity);

      const updateDoc = {
        $inc: {
          bloodQuantity: -amount,
        },
      };

      const result = await BloodGroupsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    
    app.patch("/bloodGroups", async (req, res) => {
      const { bloodgroup, quantity } = req.body;
      const query = { bloodGroup: bloodgroup };
      let amount = parseInt(quantity);
      // console.log(bloodgroup, quantity);

      const updateDoc = {
        $inc: {
          bloodQuantity: amount,
        },
      };

      const result = await BloodGroupsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('BloodBridge is running');
})

app.listen(port, () => {
  console.log(`BloodBridge is running on port ${port}`);
})
