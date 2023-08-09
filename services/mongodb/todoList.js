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
  }
});

const todoListData = mongoose.model("todoList", todoSchema);
module.exports = todoListData;
