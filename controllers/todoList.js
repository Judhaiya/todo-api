const { fetchingTodos } = require("../features/todoList");

exports.getAllTodos = async () => {
  const todoList = await fetchingTodos();
  return todoList;
};
