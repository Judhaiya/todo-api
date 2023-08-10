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
  referenceUrl: {
    type: String
  }
});

const TodoListData = mongoose.model("todoList", todoSchema);
module.exports = TodoListData;
