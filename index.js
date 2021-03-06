const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

///database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvpgl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("Library");
        const bookDataCollections = database.collection("bookdata");
        const usersCollections = database.collection("users");
        const usersProfileCollections = database.collection("profile");
        const customerCartCollection = database.collection("customerCart");
        //add user
        app.post('/users',async(req,res)=>{
            const users=req.body;
            const result = await usersCollections.insertOne(users);
            //console.log(result);
            res.json(result);
        })
        //make admin
        app.put('/users/admin',async(req,res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set:{role:'admin'}};
            const result = await usersCollections.updateOne(filter,updateDoc);
            res.send(result);
        })
        //secure admin
        app.get('/users/:email',async(req,res)=>{
            const email=req.params.email;
            const query = {email:email};
            const user = await usersCollections.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })
        // add book data
        app.post('/addBookData',async(req,res)=>{
            // console.log('body', req.body);
            // console.log('files',req.files);
            const bookName = req.body.bookName;
            const price = req.body.bookPrice;
            const authorName = req.body.authorName;
            const publisherName = req.body.publisherName;
            const bookType = req.body.bookType;
            const uploadedBookImg = req.files.bookImage;
            const bookimgData = uploadedBookImg.data;
            const encodedBookImg = bookimgData.toString('base64');
            const bookImgBuffer = Buffer.from(encodedBookImg, 'base64');
            const image={
                bookName,
                price,
                authorName,
                publisherName,
                bookType,
                bookImage: bookImgBuffer
            }
            const result = await bookDataCollections.insertOne(image);
            //console.log(result);
            res.json(result);
        });
        //get books data
        app.get('/addBookData', async(req,res)=>{
            const cursor = bookDataCollections.find({});
            const result = await cursor.toArray();
            res.json(result);
        });
        //add profile
        app.put('/users', async(req,res)=>{
                console.log('body', req.body);
                console.log('files', req.files);
              const displayName = req.body.name;
              const email = req.body.email;
              const filter = {email: email};
              const userPhoneNumber = req.body.phoneNumber;
              const userAddress = req.body.address;
              const teacherEmail = req.body.teacherEmail;
              const friendEmail = req.body.friendEmail;
              const userProfliePic = req.files.profilePictute;
              const status = req.body.status;
              console.log(status);
              const profilePicData = userProfliePic.data;
              const encodedProfilePic = profilePicData.toString('base64');
              const profilePicBuffer = Buffer.from(encodedProfilePic, 'base64');
              const photo={
                displayName,
                userPhoneNumber,
                userAddress,
                teacherEmail,
                friendEmail,
                status,
                profilePictute: profilePicBuffer
              }
              console.log(photo);
              const updateDoc = {$set:photo};
              const result = await usersCollections.updateOne(filter,updateDoc);
              console.log(result);
              res.json(result);
          });
        //get profile data
        app.get('/profile', async(req,res)=>{
            const cursor = usersProfileCollections.find({});
            const profile = await cursor.toArray();
            //console.log(profile);
            res.json(profile);
        });
        //get order from customer
        app.post('/cart', async(req,res)=>{
            const user = req.body;
            const result = await customerCartCollection.insertOne(user);
            //console.log(result);
            res.json(result);
        });
        //get cart data for table
        app.get('/cart', async(req,res)=>{
            const cursor = customerCartCollection.find({});
            const result = await cursor.toArray();
            //console.log(result);
            res.json(result);
        });
        //get all user data for table
        app.get('/users', async(req,res)=>{
            const cursor = await usersCollections.find();
            const result = await cursor.toArray();
            console.log('get user',result);
            res.json(result);
        });
        //delete booking book
        app.delete('/cart/:id', async(req,res)=>{
        const id = req.params.id;
        const query = { _id : ObjectId(id) };
        const result = await customerCartCollection.deleteOne(query);
        //console.log('deleting id', result);
        res.json(result);
      });
        //remove admin from users collection
        app.delete('/users/:id', async(req,res)=>{
        const id = req.params.id;
        const query = { _id : ObjectId(id) };
        const result = await usersCollections.deleteOne(query);
        //console.log('deleting id', result);
        res.json(result);
      });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Library management System server ');
});

app.listen(port, () => {
    console.log('Running Server on port', port);
})