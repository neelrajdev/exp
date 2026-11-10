import mongoose from 'mongoose';

let isConnected = false;
let dbMode = 'uninitialized';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saasflow';
  try {
    mongoose.set('strictQuery', false);
    // Timeout quickly (1500ms) if local MongoDB daemon is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500
    });
    isConnected = true;
    dbMode = 'mongodb';
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
    return { mode: 'mongodb', uri };
  } catch (err) {
    isConnected = false;
    dbMode = 'in-memory-fallback';
    console.warn(`[Database] MongoDB not reachable at ${uri}. Operating in resilient In-Memory Store mode.`);
    return { mode: 'in-memory-fallback', reason: err.message };
  }
}

export function getDbMode() {
  return dbMode;
}

export function isDbConnected() {
  return isConnected;
}

