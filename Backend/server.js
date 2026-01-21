import express from "express";
import { config } from "dotenv";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import cors from "cors";

config();

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "passman";
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());


await client.connect();

// console.log(process.env.MONGO_URI) // remove this after you've confirmed it is working

// Get passwords
app.get("/", async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection("passwords");
  const findResult = await collection.find({}).toArray();
  res.json(findResult);
});

// Save passwords
app.post("/", async (req, res) => {
  const password = req.body;
  const db = client.db(dbName);
  const collection = db.collection("passwords");
  const findResult = await collection.insertOne(password);
  res.send({ success : true, result:findResult});
});

// Delete passwords by ID
app.delete("/", async (req, res) => {
  const password = req.body;
  const db = client.db(dbName);
  const collection = db.collection("passwords");
  const findResult = await collection.deleteOne(password);
  res.send(req.body);
});
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
