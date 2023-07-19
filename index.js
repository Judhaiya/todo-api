const express = require("express")
const authRoutes = require("./routes/AuthRoute")
const { connectDB } = require("./utils/databaseConnection")

const app = express()
const dotenv = require("dotenv")
dotenv.config()

const startServer = async () => {
  await connectDB()
  app.listen(8080, () => {
    console.log("listening to port 8080")
  })
}
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
startServer()

app.use("/api/auth", authRoutes)
