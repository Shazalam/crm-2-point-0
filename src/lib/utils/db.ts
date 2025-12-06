// import mongoose, { Mongoose } from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI as string;
// if (!MONGODB_URI) throw new Error("⚠️ Please define MONGODB_URI");

// // ✅ Extend global type to store cached connection
// declare global {
//   var mongooseCache: {
//     conn: Mongoose | null;
//     promise: Promise<Mongoose> | null;
//   } | undefined;
// }

// const cached = global.mongooseCache || { conn: null, promise: null };

// export async function connectDB(): Promise<Mongoose> {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
//   }

//   cached.conn = await cached.promise;
//   global.mongooseCache = cached;

//   return cached.conn;
// }






import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("⚠️ Missing MONGODB_URI environment variable");

// Extend global type only once
declare global {
  var _mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// If not exists, create global cache
if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<Mongoose> {
  if (global._mongoose.conn) return global._mongoose.conn;

  if (!global._mongoose.promise) {
    global._mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => {
        console.log("📌 Connected to MongoDB Successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        throw err;
      });
  }

  global._mongoose.conn = await global._mongoose.promise;
  return global._mongoose.conn;
}
