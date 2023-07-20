const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
  try {
    console.log(mongoose.connection.readyState, "mongodb connection");
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log("error occured", err);
  }
};
module.exports = { connectDB };
