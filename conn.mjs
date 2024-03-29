import { config } from "dotenv";
config("./.env");
// Import the MongoDB driver
import { MongoClient } from "mongodb";

console.log("Loading env variables..");
console.log({
  ATLAS_USERNAME: process.env.ATLAS_USERNAME,
  ATLAS_PASSWORD: process.env.ATLAS_PASSWORD,
});

// Using fake email to allow accessing atlas mongodb cluster
const username = encodeURIComponent(process.env.ATLAS_USERNAME);
const password = encodeURIComponent(process.env.ATLAS_PASSWORD);

// Define our connection string
const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.kqbw20g.mongodb.net/?retryWrites=true&w=majority&maxIdleTimeMS=6000`;

// Once we connect to the database once,
// we'll store that connection and reuse
// it so that we don't have to connect to
// the database on every request.
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    console.log("MongoDB connected");
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(MONGODB_URI);

  // Specify which database we want to use
  const db = await client.db("lemn");

  cachedDb = db;
  return db;
}
