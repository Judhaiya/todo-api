const express = require("express");
const router = express.Router();
const {
  getAllTodos,
  getSingleTodo,
  createNewTodo,
  updateSingleTodo,
  deleteTodo
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
 * @apiSuccessExample {Object} Success-Response:
 *  HTTP/1.1 200 OK
 *  { todos: [ {
      id: 'KNqWWyyxaIasMZBCsh81',
      createdAt: [Object],
      taskName: 'to watch movie',
      isCompleted: false
    }.
     {
      id: '7jubLg68DpagzXGcClEs',
      createdAt: [Object],
      taskName: 'to plan for next weekend',
      referencePath: 'todos/images/image-1694164639587-292994228.jpeg',
      isCompleted: false,
      imageUrl: "https://sample-url/"
    }
  ]
}
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
/**
 * @api {get} /todos/getSingleTodo request a single todo by id
 * @apiName getSingleTodo
 * @apiGroup todos

  * @apiQuery {Number} id unique todo id
  * @apiSuccess {Object} todo
  * @apiSuccessExample {Object} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     id: 'KNqWWyyxaIasMZBCsh81',
      createdAt: [Object],
      taskName: 'to watch movie',
      isCompleted: false
*   }

* @apiError  invalidId Cannot find todo with the provided id,Invalid id
 */
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

/**
 * @api {post} /todos/createTodo create a todo
 * @apiName createTodo
 * @apiGroup todos
 * @apiBody (Login) {Object} payload
 * @apiBody (Login) {String} payload.taskName
 * @apiBody (Login) {String} [payload.image]
 * @apiSuccess {number} id
 * @apiSuccessExample {Object} Success-Response:
 *     HTTP/1.1 200 OK
 *   todo: {
 *     msg: "todo created successfully"
 *     todoId: 'KNqWWyyxaIasMZBCsh81'
 *   }
 */

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

/**
 * @api {patch} /todos/updateTodo update a single todo
 * @apiName updateTodo
 * @apiGroup todos
 * @apiBody (Login) {Object} payload
 * @apiBody (Login) {String} [payload.taskName]
 *  @apiBody (Login) {String} payload.id
 * @apiBody (Login) {String} [payload.image]
 *  @apiError noImageandTaskName  Image and taskName shouldn't be empty
 * @apiSuccessExample {Object} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     msg: "Details have been updated successfully"
 *   }
 */

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

/**
 * @api {delete} /todos/deleteTodo delete a todo
 * @apiName deleteTodo
 * @apiGroup todos
 *  @apiBody (Login) {String} payload.id
 *  @apiError invalidId  todo id doesn't exists.Please enter valid id
 *  @apiSuccessExample {Object} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     msg: "todo has been deleted successfully"
 *   }
  */

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

module.exports = router;
