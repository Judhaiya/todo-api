const mongoose = require("mongoose");
const todoSchema = new mongoose.Schema({
  taskName: {
    type: String
  },
  image: {
    type: String
  },
  isCompleted: {
    type: Boolean
  },
  referencePath: {
    type: String
  },
  createdAt: {
    type: Object
  }
});

const TodoListData = mongoose.model("todoList", todoSchema);
module.exports = TodoListData;
