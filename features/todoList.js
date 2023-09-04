const {
  addDocument,
  read,
  updateDocument,
  deleteDocument
} = require("../services/firebase/firestore.queries");
const { requestError } = require("../services/errors");
const {
  getDownlodableUrl,
  deleteFileInStorage
} = require("../services/firebase/actionFunctions");
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
      const todoWithImage = Object.assign({}, todo, {
        imageUrl: imageUploadUrl
      });
      todoItems = [...todoItems, todoWithImage];
      return todoItems;
    }
    todoItems = [...todoItems, todo];
  }
  return todoItems;
};
exports.fetchingSingleTodo = async (req) => {
  const singleTodo = await read.singleById("todos", { id: req.query.id });
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
    const fileDestination = path.join(
      normalizePath(req.file.path).split("\\")[0],
      normalizePath(req.file.path).split("\\")[1],
      normalizePath(req.file.path).split("\\")[2]
    );
    await uploadFile(
      fileDestination,
      `todos/images/${normalizePath(req.file.path).split("\\")[2]}`
    );
    payload = {
      ...payload,
      referencePath: `todos/images/${
        normalizePath(req.file.path).split("\\")[2]
      }`
    };
  }
  const newlyCreatedTodoId = await addDocument("todos", payload);
  return newlyCreatedTodoId;
};
exports.updateTodo = async (req) => {
  let payload;
  const getMatchingCollection = await read.singleById("todos", {
    id: req.body.id
  });
  if (!getMatchingCollection) {
    throw requestError("todo doesn't exists");
  }
  if (!req.file) {
    payload = {
      filter: { id: req.body.id },
      update: { taskName: req.body.taskName }
    };
    await updateDocument.updateDocumentById("todos", payload);
  } else {
    if (getMatchingCollection.referencePath !== undefined) {
      await deleteFileInStorage(getMatchingCollection?.referencePath);
    }
    const fileDestination = path.join(
      normalizePath(req.file.path).split("\\")[0],
      normalizePath(req.file.path).split("\\")[1],
      normalizePath(req.file.path).split("\\")[2]
    );
    await uploadFile(
      fileDestination,
      `todos/images/${normalizePath(req.file.path).split("\\")[2]}`
    );
    payload = {
      filter: { id: req.body.id },
      update: {
        referencePath: `todos/images/${
          normalizePath(req.file.path).split("\\")[2]
        }`
      }
    };
    if (req.body.taskName !== undefined) {
      payload = {
        filter: { id: req.body.id },
        update: {
          taskName: req.body.taskName,
          referencePath: `todos/images/${
            normalizePath(req.file.path).split("\\")[2]
          }`
        }
      };
    }
    await updateDocument.updateDocumentById("todos", payload);
  }
};

exports.deleteTodo = async (req) => {
 const getMatchingCollection = await read.singleById("todos", {
    id: req.body.id
  });
  if (!getMatchingCollection) {
    throw requestError("todo id doesn't exists.Please enter valid id");
  }
  await deleteDocument.deleteDocumentById("todos", { id: req.body.id });
};
