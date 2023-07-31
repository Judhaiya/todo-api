const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error("error occured", err);
  }
};
module.exports = { connectDB };
