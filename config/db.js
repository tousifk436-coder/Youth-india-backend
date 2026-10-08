// config/db.js
import mongoose from "mongoose";

/**
 * Connects to MongoDB (MONGO_URI in .env). Retries a few times, then stops the
 * process so the hosting platform can restart it instead of running without a database.
 */
const connectDB = async (retries = Number(process.env.DB_CONNECT_RETRIES) || 5) => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }
  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
      console.log("Connected DB:", mongoose.connection.name);
      console.log("Mongo Host:", mongoose.connection.host);
      return mongoose.connection;
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${attempt}/${retries}):`, error.message);
      if (attempt === retries) process.exit(1);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
};

mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("✅ MongoDB reconnected"));

export default connectDB;
