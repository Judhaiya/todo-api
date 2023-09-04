const express = require("express");
const authRoutes = require("./routes/authentication");
const todoListRoutes = require("./routes/todoList");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

const startServer = async () => {
  app.listen(8080);
};
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoListRoutes);
startServer();
