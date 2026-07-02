import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Missing MongoDB URI. Set MONGODB_URI in .env.local.');
}

const options = {};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const connectedClient = await clientPromise;
  const dbName = process.env.MONGODB_DB_NAME || new URL(uri).pathname.replace('/', '').split('?')[0] || 'ai-mock-interview';
  return connectedClient.db(dbName);
}
