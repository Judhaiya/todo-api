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

/**
 * A module that fetches todos from database
 * @module fetchingTodos
 * @return {Promise<object[]>}
 */

exports.fetchingTodos = async () => {
  const allTodos = await read.all("todos");
  /** throw error if no todo available in the database */
  if (!allTodos) {
    throw requestError("No todos available please create a todo");
  }
  /**  loop all the todo items in the database ,if the todo has reference path,fetch downladable url corresponding to that path from storage */
  /** finally return todo that has image url with image url else return todo with tododetails only */
  let todoItems = [];
  for (const todo of allTodos) {
    if (todo.referencePath !== undefined) {
      const imageUploadUrl = await getDownlodableUrl(todo.referencePath);
      const todoWithImage = Object.assign({}, todo, {
        imageUrl: imageUploadUrl
      });
      todoItems = [...todoItems, todoWithImage];
    } else {
      todoItems = [...todoItems, todo];
    }
  }
  return todoItems;
};

/**
 * A module that fetches todos from database
 * @module fetchingSingleTodo.
 * @return {Promise<object>}.
 * @param {object} req - req object
 */

exports.fetchingSingleTodo = async (req) => {
  const singleTodo = await read.singleById("todos", { id: req.query.id });
  /** throw error if the id provided is invalid */
  if (!singleTodo) {
    throw requestError("Cannot find todo with the provided id,Invalid id");
  }
  /** if the particular todo details returned by id has reference path,fetch relevant image from firebase cloud storage for that reference path
   */
  if (singleTodo.referencePath !== undefined) {
    const filePath = await getDownlodableUrl(singleTodo.referencePath);
    return Object.assign({}, singleTodo, { imageUrl: filePath });
  }
  return singleTodo;
  /** if particular todo has reference path,return todo with imageUrl else return todo details only */
};

/**
 * A module that fetches todos from database
 * @module createTodo.
 * @return {string} id - id of created todo.
 * @param {object} req - req.body receives taskName ,req.file receives image uploaded if any.
 */

exports.createTodo = async (req) => {
  let payload;
  payload = {
    taskName: req.body.taskName,
    isCompleted: false,
    createdAt: new Date()
  };
  if (req.file) {
    /** normalize path = it replaces forward slash with double slash */
    const fileDestination = path.join(
      normalizePath(req.file.path).split("\\")[0],
      normalizePath(req.file.path).split("\\")[1],
      normalizePath(req.file.path).split("\\")[2]
    );
    await uploadFile(
      fileDestination,
      `todos/images/${normalizePath(req.file.path).split("\\")[2]}`
    );
    /** save reference path in the database in order to fetch image from the cloud storage */
    payload = {
      ...payload,
      referencePath: `todos/images/${
        normalizePath(req.file.path).split("\\")[2]
      }`
    };
  }
  /** add or save todo data in the database */
  const newlyCreatedTodoId = await addDocument("todos", payload);
  return newlyCreatedTodoId;
};

/**
 * A module that update todos in the database
 * @module updateTodo
 * @param {object} req - req.body receives id of todo to be updated
 */

exports.updateTodo = async (req) => {
  let payload;
  const getMatchingCollection = await read.singleById("todos", {
    id: req.body.id
  });
  /** throw error if provided id is not a valid one */
  if (!getMatchingCollection) {
    throw requestError("todo doesn't exists");
  }
  if (!req.file) {
    payload = {
      filter: { id: req.body.id },
      update: { taskName: req.body.taskName }
    };
    /** updating todo in the database */
    await updateDocument.updateDocumentById("todos", payload);
  } else {
    /** delete existing image in firebase cloud storage */
    if (getMatchingCollection.referencePath !== undefined) {
      await deleteFileInStorage(getMatchingCollection?.referencePath);
    }
    /** normalize path = it replaces forward slash with double slash */
    const fileDestination = path.join(
      normalizePath(req.file.path).split("\\")[0],
      normalizePath(req.file.path).split("\\")[1],
      normalizePath(req.file.path).split("\\")[2]
    );
    /** uploading the updated image or newly uploaded image (if there is no existing img in storage) in cloud storage */
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
    /** updating todo details in the database */
    await updateDocument.updateDocumentById("todos", payload);
  }
};

/**
 * A module that delete particular todo by id in the database
 * @module deleteTodo
 * @param {object} req - req.body receives id of todo to be deleted
 */

exports.deleteTodo = async (req) => {
  /** getting details of single todo from database  */
  const getMatchingCollection = await read.singleById("todos", {
    id: req.body.id
  });
  /**  throw error if id doesn't exists */
  if (!getMatchingCollection) {
    throw requestError("todo id doesn't exists.Please enter valid id");
  }
  /** deleting details of single todo from database  */
  await deleteDocument.deleteDocumentById("todos", { id: req.body.id });
};
