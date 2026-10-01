import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Missing MongoDB URI. Set MONGODB_URI in .env.local.');
}

const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  maxPoolSize: 10,
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

let indexesCreated = false;

async function ensureIndexes(db) {
  if (indexesCreated) return;
  try {
    // Add appropriate indexes for userId, email, and createdAt / timestamp
    await Promise.allSettled([
      db.collection('userActivity').createIndex({ userId: 1 }),
      db.collection('userActivity').createIndex({ email: 1 }),
      db.collection('userActivity').createIndex({ createdAt: -1 }),
      db.collection('userActivity').createIndex({ timestamp: -1 }),

      db.collection('mockInterview').createIndex({ createdBy: 1 }),
      db.collection('mockInterview').createIndex({ userId: 1 }),
      db.collection('mockInterview').createIndex({ mockId: 1 }),

      db.collection('aptitudeTest').createIndex({ createdBy: 1 }),
      db.collection('aptitudeTest').createIndex({ userId: 1 }),
      db.collection('aptitudeTest').createIndex({ mockId: 1 }),

      db.collection('userAnswer').createIndex({ userEmail: 1 }),
      db.collection('userAnswer').createIndex({ mockIdRef: 1 }),

      db.collection('question').createIndex({ createdBy: 1 }),

      db.collection('chatHistory').createIndex({ userId: 1 }),
      db.collection('chatHistory').createIndex({ userEmail: 1 }),
      db.collection('chatHistory').createIndex({ chatId: 1 }),
    ]);
    indexesCreated = true;
  } catch (e) {
    console.error('Failed to create indexes:', e);
  }
}

export async function connectToDatabase() {
  const connectedClient = await clientPromise;
  const dbName = process.env.MONGODB_DB_NAME || new URL(uri).pathname.replace('/', '').split('?')[0] || 'ai-mock-interview';
  const db = connectedClient.db(dbName);
  ensureIndexes(db).catch(() => {});
  return db;
}
