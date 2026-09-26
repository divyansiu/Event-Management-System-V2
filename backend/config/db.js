const dns = require("dns");
const mongoose = require("mongoose");

// Set reliable public DNS servers to resolve MongoDB Atlas SRV records on Windows/ISP networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if dns.setServers is restricted
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;