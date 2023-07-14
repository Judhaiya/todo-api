const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const connectDB = async () => {
  try {
    const isConnected = await mongoose.connect(process.env.MONGO_URI)
    if (isConnected) {
      console.log("connected to db")
    }
  }
  catch (err) {
    console.log("error occured", err)
  }
}
module.exports = { connectDB }
