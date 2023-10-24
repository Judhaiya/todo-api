const {
  fetchingTodos,
  fetchingSingleTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteAllTodos
} = require("../features/todoList");

/**
 * getAllTodos function calls fetchingTodos function,after fetchingTodos resolves it will return todoList
 * if resolved with error,it will throw an error
 * @returns {Array} todolist
 */
exports.getAllTodos = async () => {
  const todoList = await fetchingTodos();
  return todoList;
};

/**
 * @param {Object} req
 * getSingleTodo function calls fetchingSingleTodo function,after fetchingSingleTodo resolves it will return singleTodo
 * if resolved with error,it will throw an error
 * @returns {Object} todolist
 */

exports.getSingleTodo = async (req) => {
  const singleTodo = await fetchingSingleTodo(req);
  return singleTodo;
};

/**
 * @param {Object} req
 * createNewTodo function calls createTodo function,after createTodo resolves it will return singleTodo
 * if resolved with error,it will throw an error
 * @returns {string} newTodoId
 */

exports.createNewTodo = async (req) => {
  const newTodoId = await createTodo(req);
  return newTodoId;
};

/**
 * @param {Object} req
 * updateSingleTodo function calls asynchronous updateTodo function
 * if resolved with error,it will throw an error
 * after successfully resolved,it will update the respective task in database
 */

exports.updateSingleTodo = async (req) => {
  await updateTodo(req);
};

/**
 * @param {Object} req
 * deleteTodo function calls asynchronous deleteTodo function
 * if resolved with error,it will throw an error
 *  after successfully resolved,it will delete the respective task by id in database
 */
exports.deleteTodo = async (req) => {
  await deleteTodo(req);
};
