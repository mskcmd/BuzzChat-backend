const mongoose = require("mongoose");


const MONGO_URI = "mongodb://localhost:27017/BuzzChat";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);  }
};

module.exports = { connectDB };
