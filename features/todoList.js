const { getAllCollection, addCollection, readCollection, updateCollection, deleteCollection, deleteAllDocument } = require("../services/mongodb/actionFunctions");
const { requestError } = require("../services/errors");
const { getDownlodableUrl, deleteFileInStorage } = require("../services/firebase/actionFunctions");
const { uploadAndDeleteInDisk } = require("../services/fileUtility");

const path = require("path");

exports.fetchingTodos = async () => {
  const allTodos = await getAllCollection("todos");
  if (!allTodos) {
    throw requestError("No todos available please create a todo");
  }
  for (const todo of allTodos) {
    if ("referencePath" in todo) {
      const imageUploadUrl = await getDownlodableUrl(todo.referencePath);
      Object.assign(todo, { imageUrl: imageUploadUrl });
    }
  }
  return allTodos;
};

exports.fetchingSingleTodo = async (req) => {
  const singleTodo = await readCollection("todos", { _id: req.query.id });
  if (!singleTodo) {
    throw requestError("Cannot find todo with the provided id,Invalid id");
  }

  if (singleTodo.referencePath !== undefined) {
    const filePath = await getDownlodableUrl(singleTodo.referencePath);
    return { ...singleTodo, imageUrl: filePath };
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
    const normalizePath = path.normalize(req.file.path);
    const fileDestination = path.join(normalizePath.split("/")[0], normalizePath.split("/")[1], normalizePath.split("/")[2]);
    await uploadAndDeleteInDisk(fileDestination, `todos/images/${normalizePath.split("/")[2]}`);
    payload = { ...payload, referencePath: `todos/images/${normalizePath.split("/")[2]}` };
  }
  await addCollection("todos", payload);
  const newlyCreatedTodo = await readCollection("todos", { taskName: req.body.taskName });
  return newlyCreatedTodo.id;
};

exports.updateTodo = async (req) => {
  let payload;
  const getMatchingCollection = await readCollection("todos", { id: req.body.id });
  if (!getMatchingCollection) {
    throw requestError("todo doesn't exists");
  }
  if (req.file === "") {
    payload = {
      filter: { id: req.body.id },
      update: { taskName: req.body.taskName }
    };
    await updateCollection("todos", payload);
    return;
  }
  if ("referencePath" in getMatchingCollection) {
    await deleteFileInStorage(getMatchingCollection?.referencePath);
  }
  const fileDestination = path.join(req?.file?.path.split("\\")[0], `${req?.file?.path.split("\\")[1]}`, `${req?.file?.path.split("\\")[2]}`);
  await uploadAndDeleteInDisk(fileDestination, `todos/images/${req?.file?.path.split("\\")[2]}`);
  payload = {
    filter: { id: req.body.id },
    update: { taskName: req.body.taskName, referencePath: `todos/images/${req?.file?.path.split("\\")[2]}` }
  };
  await updateCollection("todos", payload);
};

exports.deleteTodo = async (req) => {
  const getMatchingCollection = readCollection("todos", { id: req.body.id });
  if (!getMatchingCollection) {
    throw requestError("todo id doesn't exists.Please enter valid id");
  }
  await deleteCollection("todos", { id: req.body.id });
};

exports.deleteAllTodos = async () => {
  await deleteAllDocument("todos");
};
