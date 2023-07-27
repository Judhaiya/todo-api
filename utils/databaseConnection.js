const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;
    console.log(mongoose.connection.readyState, "readyState");
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log("error occured", err);
  }
};
module.exports = { connectDB };
