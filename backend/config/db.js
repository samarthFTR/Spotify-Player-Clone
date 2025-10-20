import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MongoDB connection string is missing");
    process.exit(1);
  }
  const dbName = process.env.MONGO_DB_NAME || "ragnify";
  try {
    await mongoose.connect(uri, { dbName });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};
