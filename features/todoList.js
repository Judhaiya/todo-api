const { getAllCollection } = require("../services/mongodb/actionFunctions");
const { requestError } = require("../services/errors");

exports.fetchingTodos = async () => {
  const allTodos = await getAllCollection("todos");
  if (!allTodos) {
    throw requestError("No todos available please create a todo");
  }
  return allTodos;
};
// exports.fetchingSingleTodo = async () => {

// }