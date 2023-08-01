const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const { baseUrl } = require("../utils/baseUrl");
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) { return; }
    await mongoose.connect(baseUrl.local.MONGO_URL);
  } catch (err) {
    console.error("error occured", err);
  }
};
module.exports = { connectDB };
