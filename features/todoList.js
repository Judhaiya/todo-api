const { getAllCollection, addCollection, readCollection } = require("../services/mongodb/actionFunctions");
const { requestError } = require("../services/errors");
const { getStorage, getDownloadURL } = require("firebase-admin/storage");

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
  return singleTodo;
};

exports.createTodo = async (req) => {
  let payload;
  let newlyCreatedTodo;
  if (req.body.taskName === "") { return; }
  if (req.files.image === "") {
    payload = {
      taskName: req.body.taskName
    };
    await addCollection("todos", payload);
    newlyCreatedTodo = readCollection("todos", { taskName: req.body.taskName });
    return newlyCreatedTodo.id;
  }
  const fileRef = getStorage().bucket().file(req.files.image.path);
  const downloadableUrl = await getDownloadURL(fileRef);
  payload = {
    taskName: req.body.taskName,
    referenceUrl: fileRef,
    image: downloadableUrl
  };
  await addCollection("todos", payload);
  newlyCreatedTodo = readCollection("todos", { taskName: req.body.taskName });
  return newlyCreatedTodo.id;
};
