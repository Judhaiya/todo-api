const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/AuthRoute")

const app = express()
const dotenv = require("dotenv")
dotenv.config()
app.listen(8080, () => {
  console.log("listening on port 8080")
})
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
const connectDB = async () => {
  try {
    const isConnected = await mongoose.connect(process.env.MONGO_URI)
    if (isConnected) {
      console.log("connected")
    }
  }
  catch (err) {
    console.log("error occured",err)
    console.log("error occured",err)
  }
}
connectDB()
app.use("/api/auth", authRoutes)