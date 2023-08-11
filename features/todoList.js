const { getAllCollection, addCollection, readCollection } = require("../services/mongodb/actionFunctions");
const { requestError } = require("../services/errors");
const { getDownlodableUrl, uploadFile } = require("../services/firebase/actionFunctions");
const path = require("path");

exports.fetchingTodos = async () => {
  const allTodos = await getAllCollection("todos");
  if (!allTodos) {
    throw requestError("No todos available please create a todo");
  }
  return allTodos;
};

exports.fetchingSingleTodo = async (req) => {
  const singleTodo = await readCollection("todos", { id: req.query.id });

  if (!singleTodo) {
    throw requestError("Cannot find todo with the provided id,Invalid id");
  }
  if (singleTodo.referencePath === "") { return singleTodo; }
  const filePath = await getDownlodableUrl(singleTodo.referencePath);
  return { ...singleTodo, image: filePath };
};

exports.createTodo = async (req) => {
  let payload;
  let newlyCreatedTodo;
  if (req.body.taskName === "") { return; }
  if (req.file === "") {
    payload = {
      taskName: req.body.taskName,
      isCompleted: false
    };
    await addCollection("todos", payload);
    newlyCreatedTodo = readCollection("todos", { taskName: req.body.taskName });
    return newlyCreatedTodo.id;
  }
  const fileDestination = path.join(req?.file?.path.split("\\")[0], `${req?.file?.path.split("\\")[1]}`, `${req?.file?.path.split("\\")[2]}`);
  uploadFile(fileDestination, `todos/images/${req?.file?.path.split("\\")[2]}`);
  payload = {
    taskName: req.body.taskName,
    referencePath: `todos/images/${req?.file?.path.split("\\")[2]}`,
    isCompleted: false
  };
  await addCollection("todos", payload);
  newlyCreatedTodo = readCollection("todos", { taskName: req.body.taskName });
  return newlyCreatedTodo.id;
};
