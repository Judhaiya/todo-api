const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/AuthRoute")
const connectDB = require('./utils/databaseConnection')

const app = express()
const dotenv = require("dotenv")
dotenv.config()
app.listen(8080, () => {
  console.log("listening on port 8080")
})
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

connectDB()
app.use("/api/auth", authRoutes)