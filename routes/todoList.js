const express = require("express");
const router = express.router();
const { getAllTodos, getSingleTodo, createNewTodo } = require("../controllers/todoList");
const { errorHandler } = require("../services/errors");
const { validation } = require("../middlewares/validation");
const { tokenValidation } = require("../middlewares/tokenValidation");

const multer = require("multer");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/getAllTodos", tokenValidation, async (req, res) => {
  try {
    const todoList = await getAllTodos();
    res.status(200).json({ todos: todoList });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});

router.get("/getSingleTodo", tokenValidation, async (req, res) => {
  try {
    const singleTodo = await getSingleTodo(req);
    res.status(200).json({ todo: singleTodo });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  }
});
const upload = multer({ storage });

router.get("/createTodo", validation, tokenValidation, upload.single("image"), async (req, res) => {
  try {
    const createdTodoId = await createNewTodo(req);
    res.status(200).json({ todoId: createdTodoId });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});
