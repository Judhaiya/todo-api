const { getAllCollection, addCollection, readCollection, updateCollection, deleteCollection, deleteAllDocument } = require("../services/mongodb/actionFunctions");
const { requestError } = require("../services/errors");
const { getDownlodableUrl, deleteFileInStorage } = require("../services/firebase/actionFunctions");
const { uploadFile } = require("../services/firebase/actionFunctions");
const { normalizePath } = require("../services/formatter");
const fs = require("fs");

const path = require("path");

exports.fetchingTodos = async () => {
  const allTodos = await getAllCollection("todos");
  if (!allTodos) {
    throw requestError("No todos available please create a todo");
  }
  let todoItems = [];
  for (const todo of allTodos) {
    if (todo.referencePath !== undefined) {
      const imageUploadUrl = await getDownlodableUrl(todo.referencePath);
      const todoWithImage = Object.assign({}, todo._doc, { imageUrl: imageUploadUrl });
      todoItems = [...todoItems, todoWithImage];
      return todoItems;
    }
    todoItems = [...todoItems, todo];
  }
  return todoItems;
};
exports.fetchingSingleTodo = async (req) => {
  const singleTodo = await readCollection("todos", { _id: req.query.id });
  if (!singleTodo) {
    throw requestError("Cannot find todo with the provided id,Invalid id");
  }
  if (singleTodo.referencePath !== undefined) {
    const filePath = await getDownlodableUrl(singleTodo.referencePath);
    return Object.assign({}, singleTodo._doc, { imageUrl: filePath });
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
  await addCollection("todos", payload);
  const newlyCreatedTodo = await readCollection("todos", { taskName: req.body.taskName });
  return newlyCreatedTodo.id;
};

exports.updateTodo = async (req) => {
  let payload;
  const getMatchingCollection = await readCollection("todos", { _id: req.body.id });
  if (!getMatchingCollection) {
    throw requestError("todo doesn't exists");
  }
  if (!req.file) {
    payload = {
      filter: { _id: req.body.id },
      update: { taskName: req.body.taskName }
    };
    await updateCollection("todos", payload);
    return;
  }
  if (getMatchingCollection.referencePath !== undefined) {
    await deleteFileInStorage(getMatchingCollection?.referencePath);
  }
  const fileDestination = path.join(normalizePath(req.file.path).split("\\")[0], normalizePath(req.file.path).split("\\")[1], normalizePath(req.file.path).split("\\")[2]);
  await uploadFile(fileDestination, `todos/images/${normalizePath(req.file.path).split("\\")[2]}`);
  payload = {
    filter: { _id: req.body.id },
    update: { taskName: req.body.taskName, referencePath: `todos/images/${normalizePath(req.file.path).split("\\")[2]}` }
  };
  await updateCollection("todos", payload);
};

exports.deleteTodo = async (req) => {
  const getMatchingCollection = readCollection("todos", { _id: req.body.id });
  if (!getMatchingCollection) {
    throw requestError("todo id doesn't exists.Please enter valid id");
  };
  await deleteCollection("todos", { _id: req.body.id });
};

exports.deleteAllTodos = async () => {
  if (await getAllCollection("todos").length === 0) {
    throw requestError("no todos in database");
  };
  await deleteAllDocument("todos");
};