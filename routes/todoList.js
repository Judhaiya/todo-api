const express = require("express");
const router = express.Router();
const { getAllTodos, getSingleTodo, createNewTodo } = require("../controllers/todoList");
const { errorHandler } = require("../services/errors");
const { validateUserSchema } = require("../middlewares/validation");
const { validateToken } = require("../middlewares/tokenValidation");

const multer = require("multer");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/getAllTodos", validateToken, async (req, res) => {
  try {
    const todoList = await getAllTodos();
    res.status(200).json({ todos: todoList });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});

router.get("/getSingleTodo", validateToken, async (req, res) => {
  try {
    const singleTodo = await getSingleTodo(req);
    res.status(200).json({ todo: singleTodo });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../todo-api/tmp/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  }
});

const upload = multer({ storage });

router.post("/createTodo", upload.single("image"), validateToken, validateUserSchema, async (req, res) => {
  try {
    const newTodoId = await createNewTodo(req);
    res.status(200).json({ msg: "todo created successfully", todoId: newTodoId });
  } catch (err) {
    console.error(err, "error in conversion");
  }
});
module.exports = router;
