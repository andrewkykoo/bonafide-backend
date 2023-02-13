let db;
import { MongoClient } from 'mongodb';

async function connectToDb(cb) {
  const client = new MongoClient(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.9eh0pho.mongodb.net/?retryWrites=true&w=majority`
  );
  await client.connect();
  db = client.db('bonafide-db');
  cb();
}

export { db, connectToDb };
