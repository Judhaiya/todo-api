const chai = require("chai");
const { fetchingTodos, fetchingSingleTodo, createTodo, updateTodo, deleteTodo, deleteAllTodos } = require("../../features/todoList");
const { connectDB } = require("../../utils/databaseConnection");
const path = require("path");
const expect = chai.expect;
const fs = require("fs");


const sampleTodoData = [
      {
            taskName: "floor cleaning"
      },
      {
            taskName: "grooming",
            image: "../../utils/assets/img-3.jpg "
      }
]

describe("fetching all todo works", () => {
      beforeEach("", async () => {
            await connectDB();
            for (const testData of sampleTodoData) {
                  let payload;
                  if (testData.image !== undefined) {
                        payload = {
                              body: { taskName: testData.taskName },
                              file: { path: path.join("utils", "assets", "img-3.jpg") }
                        }
                  } else {
                        payload = { body: { taskName: testData.taskName } };
                  }
                  try {
                        await createTodo(payload);
                  } catch (err) {
                        console.error(err, "error in creating todo");
                  }

            }
      })
      it("", () => {

      })
      afterEach("", async () => {
            deleteAllTodos()
      })
})