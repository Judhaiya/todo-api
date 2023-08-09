const express = require("express");
const router = express.router();
const { getAllTodos } = require("../features/todoList");
const { errorHandler } = require("../services/errors");

router.use(express.json());

router.get("/getAllTodos", async (req, res) => {
  try {
    const todoList = await getAllTodos();
    res.status(200).json({ todos: todoList });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});