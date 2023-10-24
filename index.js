const express = require("express");
const authRoutes = require("./routes/authentication");
const todoListRoutes = require("./routes/todoList");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

/**  express server is listening to port 8080 */
const startServer = async () => {
  app.listen(8080);
};

/** when server gets request to  "/api/auth",functions from authRoutes will be executed  */
app.use("/api/auth", authRoutes);

/** when server gets request to  "/api/todos",functions from todoListRoutes will be executed  */
app.use("/api/todos", todoListRoutes);

startServer();
/** only on calling startServer() function , server will start listening to the port 8080 */ 