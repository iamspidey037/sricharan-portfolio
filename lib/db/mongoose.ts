// lib/db/mongoose.ts
// MongoDB connection with connection pooling for Next.js
// Uses a global cached connection to prevent multiple connections in dev

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not defined in environment variables. ' +
    'Please add it to your .env.local file.'
  );
}

// Global cache to reuse connection across hot reloads in development
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if one doesn't exist
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,          // Maximum number of connections in pool
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,                // Use IPv4, skip trying IPv6
    };

    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('[MongoDB] Connected successfully ✓');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset promise on error so next attempt creates a fresh connection
    cached.promise = null;
    console.error('[MongoDB] Connection failed:', err);
    throw err;
  }

  return cached.conn;
}

// Helper to check if DB is connected
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Graceful shutdown (useful for scripts like seed.ts)
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('[MongoDB] Disconnected');
  }
}
