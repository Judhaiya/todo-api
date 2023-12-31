const UsersData = require("./user");
const TodoList = require("./todoList");

const collectionGroup = {
  users: UsersData,
  todos: TodoList
};

exports.addCollection = async (name, payload) => {
  const collectionDetails = new collectionGroup[`${name}`](payload);
  await collectionDetails.save();
};

exports.readCollection = async (name, payload) => {
  return await collectionGroup[`${name}`].findOne(payload);
};

exports.deleteCollection = async (name, payload) => {
  await collectionGroup[`${name}`].deleteOne(payload);
};

exports.getAllCollection = async (name) => {
  return await collectionGroup[`${name}`].find({});
};

exports.updateCollection = async (name, payload) => {
  await collectionGroup[`${name}`].findOneAndUpdate(payload.filter, payload.update);
};
exports.deleteAllDocument = async (name) => {
  await collectionGroup[`${name}`].deleteMany({});
};
