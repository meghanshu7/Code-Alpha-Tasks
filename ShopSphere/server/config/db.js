const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn("Continuing in development mode so the frontend can be previewed.");
  }
};

module.exports = connectDB;
