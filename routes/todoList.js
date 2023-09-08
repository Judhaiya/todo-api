const express = require("express");
const router = express.Router();
const {
  getAllTodos,
  getSingleTodo,
  createNewTodo,
  updateSingleTodo,
  deleteTodo,
  deleteAllTodoItems
} = require("../controllers/todoList");
const { errorHandler } = require("../services/errors");
const { validateUserSchema } = require("../middlewares/validation");
const { validateToken } = require("../middlewares/tokenValidation");
const multer = require("multer");
const path = require("path");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
/**
 * @api {get} /todos/getAllTodos  Request all todos in the collection
 * @apiName getAllTodos
 * @apiGroup todos
 *
 * @apiParam no parameters required
 *
 */

router.get("/getAllTodos", validateToken, async (req, res) => {
  try {
    const todoList = await getAllTodos();
    res.status(200).json({ todos: todoList });
  } catch (err) {
    errorHandler(err, res);
    console.error(err);
  }
});

router.get(
  "/getSingleTodo",
  validateToken,
  validateUserSchema,
  async (req, res) => {
    try {
      const singleTodo = await getSingleTodo(req);
      res.status(200).json({ todo: singleTodo });
    } catch (err) {
      errorHandler(err, res);
      console.error(err);
    }
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("tmp", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  }
});

const upload = multer({ storage });

router.post(
  "/createTodo",
  validateToken,
  upload.single("image"),
  validateUserSchema,
  async (req, res) => {
    try {
      const newTodoId = await createNewTodo(req);
      res
        .status(200)
        .json({ msg: "todo created successfully", todoId: newTodoId });
    } catch (err) {
      errorHandler(err, res);
      console.error(err, "error in conversion");
    }
  }
);

router.patch(
  "/updateTodo",
  validateToken,
  upload.single("image"),
  validateUserSchema,
  async (req, res) => {
    try {
      await updateSingleTodo(req);
      res.status(200).json({ msg: "Details have been updated successfully" });
    } catch (err) {
      errorHandler(err, res);
    }
  }
);

router.delete(
  "/deleteTodo",
  validateToken,
  validateUserSchema,
  async (req, res) => {
    try {
      await deleteTodo(req);
      res.status(200).json({ msg: "todo has been deleted successfully" });
    } catch (err) {
      errorHandler(err, res);
      console.error(err, "error in deleting todo");
    }
  }
);

router.delete("/deleteAllTodos", validateToken, async (req, res) => {
  try {
    await deleteAllTodoItems();
    res
      .status(200)
      .json({ msg: "all the todos have been erased successfully" });
  } catch (err) {
    errorHandler(err, res);
    console.error(err, "error in deleting all todo items");
  }
});

module.exports = router;
