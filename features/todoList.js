const { addDocument, read, updateDocument, deleteDocument } = require("../services/firebase/firestore.queries");
const { requestError } = require("../services/errors");
const { getDownlodableUrl, deleteFileInStorage } = require("../services/firebase/actionFunctions");
const { uploadFile } = require("../services/firebase/actionFunctions");
const { normalizePath } = require("../services/formatter");
const path = require("path");

exports.fetchingTodos = async () => {
  const allTodos = await read.all("todos");
  if (!allTodos) {
    throw requestError("No todos available please create a todo");
  }
  let todoItems = [];
  for (const todo of allTodos) {
    if (todo.referencePath !== undefined) {
      const imageUploadUrl = await getDownlodableUrl(todo.referencePath);
      const todoWithImage = Object.assign({}, todo, { imageUrl: imageUploadUrl });
      todoItems = [...todoItems, todoWithImage];
      return todoItems;
    }
    todoItems = [...todoItems, todo];
  }
  return todoItems;
};
exports.fetchingSingleTodo = async (req) => {
  const singleTodo = await read.single("todos", { id: req.query.id });
  if (!singleTodo) {
    throw requestError("Cannot find todo with the provided id,Invalid id");
  }
  if (singleTodo.referencePath !== undefined) {
    const filePath = await getDownlodableUrl(singleTodo.referencePath);
    return Object.assign({}, singleTodo, { imageUrl: filePath });
  }
  return singleTodo;
};

exports.createTodo = async (req) => {
  let payload;
  payload = {
    taskName: req.body.taskName,
    isCompleted: false,
    createdAt: new Date()
  };
  if (req.file) {
    const fileDestination = path.join(normalizePath(req.file.path).split("\\")[0], normalizePath(req.file.path).split("\\")[1], normalizePath(req.file.path).split("\\")[2]);
    await uploadFile(fileDestination, `todos/images/${normalizePath(req.file.path).split("\\")[2]}`);
    payload = { ...payload, referencePath: `todos/images/${normalizePath(req.file.path).split("\\")[2]}` };
  }
  await addDocument("todos", payload);
  const newlyCreatedTodo = await read.single("todos", { taskName: req.body.taskName });
  return newlyCreatedTodo.id;
};
exports.updateTodo = async (req) => {
  let payload;
  const getMatchingCollection = await read.single("todos", { id: req.body.id });
  if (!getMatchingCollection) {
    throw requestError("todo doesn't exists");
  }
  if (!req.file) {
    payload = {
      filter: { id: req.body.id },
      update: { taskName: req.body.taskName }
    };
    await updateDocument("todos", payload);
    return;
  }
  if (getMatchingCollection.referencePath !== undefined) {
    await deleteFileInStorage(getMatchingCollection?.referencePath);
  }
  const fileDestination = path.join(normalizePath(req.file.path).split("\\")[0], normalizePath(req.file.path).split("\\")[1], normalizePath(req.file.path).split("\\")[2]);
  await uploadFile(fileDestination, `todos/images/${normalizePath(req.file.path).split("\\")[2]}`);
  payload = {
    filter: { id: req.body.id },
    update: { taskName: req.body.taskName, referencePath: `todos/images/${normalizePath(req.file.path).split("\\")[2]}` }
  };
  await updateDocument("todos", payload);
};

exports.deleteTodo = async (req) => {
  const getMatchingCollection = await read.single("todos", { id: req.body.id });
  if (!getMatchingCollection) {
    throw requestError("todo id doesn't exists.Please enter valid id");
  };
  await deleteDocument("todos", { id: req.body.id });
};

// exports.deleteAllTodos = async () => {
//   if (await read.all("todos").length === 0) {
//     throw requestError("no todos in database");
//   };
//   await deleteAllDocument("todos");
// };