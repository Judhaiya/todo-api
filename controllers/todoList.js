const { fetchingTodos, fetchingSingleTodo, createTodo, updateTodo, deleteTodo, deleteAllTodos } = require("../features/todoList");

exports.getAllTodos = async () => {
  const todoList = await fetchingTodos();
  return todoList;
};

exports.getSingleTodo = async (req) => {
  const singleTodo = await fetchingSingleTodo(req);
  return singleTodo;
};

exports.createNewTodo = async (req) => {
  const newTodoId = await createTodo(req);
  return newTodoId;
};

exports.updateSingleTodo = async (req) => {
  await updateTodo(req);
};

exports.deleteTodo = async (req) => {
  await deleteTodo(req);
};

exports.deleteAllTodoItems = async () => {
  await deleteAllTodos();
};
