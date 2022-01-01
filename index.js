const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());



async function run() {
    try {
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('testing serever ');
});

app.listen(port, () => {
    console.log('Running Server on port', port);
})