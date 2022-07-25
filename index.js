const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// middle wares ------------------- 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t7ino.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("db connected");

async function run() {
    try{
        await client.connect();
        const userCollection = client.db("heliverse").collection("users");

        //Register Api-------------->
        app.post('/register', async (req, res) => {
            const data = req.body;
            console.log(data)
            const email = data.email;
            const userPass = data.password;
            const name = data.name;
            const password = await bcrypt.hash(userPass, 10);
            const users = await userCollection.find({}).toArray();

            let isUser;
            users.forEach(user => {

                if (user.email === email) {
                    return isUser = true
                } else {
                    return isUser = false
                }
            })
            if (isUser) {
                console.log(isUser)
                res.send({ message: "User already registered" })
            }
            else {
                const newUser = { name, email, password }
                const result = await userCollection.insertOne(newUser)
                res.send(result)
            }

            //Login Api------------->

            app.post('/login', async (req, res) => {
                const email = req.body.email;
                
                const password = req.body.password;
                const user = await userCollection.findOne({ email });
                console.log(user)
                if (!user) {
                    return res.send({ message: "User & password does not exist" })
                }
                if (await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '1h'
                    })
                    if (token) {
                        console.log(token)
                        return res.send({ message: "Successful", token })
                    }
                    else {
                        res.send({message: "User & password does not exist"})
                    }
                }
                res.send({message: "User & password does not exist"})
            });
        });
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Dein  task is running')
});

app.listen(port, () => {
    console.log(`Dein listening on port ${port}`)
});