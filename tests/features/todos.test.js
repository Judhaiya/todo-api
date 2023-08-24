const chai = require("chai");
const { fetchingTodos, fetchingSingleTodo, createTodo, updateTodo, deleteTodo, deleteAllTodos } = require("../../features/todoList");
const { getAllCollection, deleteAllDocument, readCollection, deleteCollection } = require("../../services/mongodb/actionFunctions");
const { connectDB } = require("../../utils/databaseConnection");
const { checkForUploadedImg } = require("../features/uploadImageCheck");
const path = require("path");
const expect = chai.expect;
const sampleTodoData = [
  {
    taskName: "floor cleaning"
  },
  {
    taskName: "grooming",
    image: "../../utils/assets/img-3.jpg"
  }
]

describe("fetching all todo works", async () => {
  let todoList = await getAllCollection("todos");
  if (todoList.length > 0) { await deleteAllTodos("todos"); }
  beforeEach("", async () => {
    await connectDB();
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        payload = {
          body: { taskName: testData.taskName },
          file: { path: path.join("utils", "assets", "img-3.jpg") }
        }
        await createTodo(payload);
      } else {
        payload = { body: { taskName: testData.taskName } };
        await createTodo(payload);
      }
    }
  })
  it("passess if we get the expected todo taskName and image", async () => {
    let todoTaskNameList = [];
    const getTodoCollection = await readCollection("todos");
    for (const todo of getTodoCollection) {
      if (todo.image !== undefined) {
        const fileDownloadPath = path.join("tests", "uploads", todo.referencePath.split("/")[2]);
        await checkForUploadedImg(fileDownloadPath, path.join(sampleTodoData.image.split("/")[2], sampleTodoData.image.split("/")[3], sampleTodoData.image.split("/")[4]), todo.referencePath);
      }
      todoTaskNameList = [...todoTaskNameList, { taskName: todo.taskName }]
    }
    const testTodosTitle = getTodoCollection.map(testTodoData => {
      return {
        taskName: testTodoData.taskName
      };
    });
    expect(todoList).to.have.deep.members(testTodosTitle);
  });
  it("throw error if we try to fetch empty documents from todo collection", async () => {
    try {
      await deleteAllDocument("todos");
      await fetchingTodos();
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.status).to.equal(400);
      expect(err.msg).to.equal("No todos available please create a todo");
    }
  });
  afterEach(async () => {
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) {
      await deleteAllDocument("todos");
    }
  })
});

describe("fetching todo by id", async () => {
  let todoList;
  let todoWithImageId;
  let todoWithoutImageId;
  beforeEach(async () => {
    await connectDB();
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) { await deleteAllTodos("todos"); }
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        payload = {
          body: { taskName: testData.taskName },
          file: { path: path.join(testData.image.split("/")[2], testData.image.split("/")[3], testData.image.split("/")[4]) }
        };
        todoWithImageId = await createTodo(payload);
      } else {
        payload = { body: { taskName: testData.taskName } };
        todoWithoutImageId = await createTodo(payload);
      };
    }
  })
  it("passess if it fetches the user uploaded image", async () => {
    const payload = {
      query: {
        id: todoWithImageId
      }
    };
    const todoDetails = await fetchingSingleTodo(payload);
    expect(todoDetails.taskName).to.eql(sampleTodoData[1].taskName);
    expect(todoDetails).to.have.property("imageUrl");
    expect(todoDetails).to.have.property("referencePath");
    expect(todoDetails).to.have.property("createdAt");
    expect(todoDetails).to.have.property("isCompleted");
    const fileDownloadPath = path.join("tests", "uploads", todoDetails.referencePath.split("/")[2]);
    await checkForUploadedImg(fileDownloadPath, path.join(sampleTodoData.image.split("/")[2], sampleTodoData.image.split("/")[3], sampleTodoData.image.split("/")[4]), todoDetails.referencePath);
  })
  it("passess if it fetches the user entered taskName", async () => {
    const payload = {
      query: {
        id: todoWithoutImageId
      }
    };
    const todoDetails = await fetchingSingleTodo(payload);
    expect(todoDetails.taskName).to.eql(sampleTodoData[0].taskName);
    expect(todoDetails).to.have.property("createdAt");
    expect(todoDetails).to.have.property("isCompleted");
  })
  it("throw error if we enter invalid id", async () => {
    await deleteCollection("todos", { _id: todoWithoutImageId });
    const payload = {
      query: {
        id: todoWithoutImageId
      }
    }
    try {
      await fetchingSingleTodo(payload)
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.status).to.equal(400);
      expect(err.msg).to.equal("Cannot find todo with the provided id,Invalid id");
    }
  })
  afterEach("", async () => {
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) {
      await deleteAllDocument("todos");
    }
  })
})

describe("create todo", () => {
  let todoList;
  beforeEach(async () => {
    await connectDB();
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) { await deleteAllTodos("todos"); }
  })
  it("create todo passes if it is created with provided payload successfully", async () => {
    for (const testData of sampleTodoData) {
      let payload;
      let todoDetails;
      if (testData.image !== undefined) {
        payload = {
          body: { taskName: testData.taskName },
          file: { path: path.join(testData.image.split("/")[2], testData.image.split("/")[3], testData.image.split("/")[4]) }
        };
        const todoWithImageId = await createTodo(payload);
        todoDetails = await readCollection("todos", { taskName: testData.taskName });
        expect(todoDetails._id).to.eql(todoWithImageId);
      } else {
        payload = { body: { taskName: testData.taskName } };
        const todoWithoutImageId = await createTodo(payload);
        todoDetails = await readCollection("todos", { taskName: testData.taskName });
        expect(todoDetails._id).to.eql(todoWithoutImageId);
        ;
      };
    }
  });
  afterEach(async () => {
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) {
      await deleteAllDocument("todos");
    };
  })
});

describe("update todos", async () => {
  let todoList;
  let todoWithImageId;
  let todoWithoutImageId;
  beforeEach(async () => {
    await connectDB();
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) { await deleteAllTodos("todos"); }
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        payload = {
          body: { taskName: testData.taskName },
          file: { path: path.join(testData.image.split("/")[2], testData.image.split("/")[3], testData.image.split("/")[4]) }
        };
        todoWithImageId = await createTodo(payload);
      } else {
        payload = { body: { taskName: testData.taskName } };
        todoWithoutImageId = await createTodo(payload);
      };
    }
  })

  it("should get user updated taskName when we update the task", async () => {
    const payload = {
      query: {
        id: todoWithoutImageId
      },
      body: {
        taskName: "to mob"
      }
    };
    await updateTodo(payload);
    const todoDetails = readCollection("todos", { _id: payload.query.id })
    expect(todoDetails.taskName).to.eql(payload.body.taskName);
  })
  it("should get user updated taskName when we update the task", async () => {
    const payload = {
      query: {
        id: todoWithImageId
      },
      file: {
        path: "../../utils/assets/img-2.jpg"
      }
    };
    await updateTodo(payload);
    const todoDetails = readCollection("todos", { _id: payload.query.id })
    expect(todoDetails.taskName).to.eql(payload.body.taskName);
    const fileDownloadPath = path.join("tests", "uploads", todoDetails.referencePath.split("/")[2]);
    await checkForUploadedImg(fileDownloadPath, path.join("utils", "assets", "img-2.jpg"), todoDetails.referencePath);
  });
  it("throw error if we enter invalid id", async () => {
    await deleteCollection("todos", { _id: todoWithoutImageId });
    const payload = {
      query: {
        id: todoWithoutImageId
      },
      body: {
        taskName: "organize the cupboard"
      }
    };
    try {
      await updateTodo(payload);
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.status).to.equal(400);
      expect(err.msg).to.equal("todo doesn't exists");
    }
  })
  afterEach(async () => {
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) {
      await deleteAllDocument("todos");
    };
  })
});
describe("delete todo by id", () => {
  let todoId;
  let todoList;
  beforeEach(async () => {
    await connectDB();
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) { await deleteAllTodos("todos"); }
    const payload = {
      body: {
        taskName: sampleTodoData[0].taskName
      }
    };
    todoId = await createTodo(payload);
  })
  it("delete by id should delete todo with respective id", async () => {
    const payload = {
      body: {
        id: todoId
      }
    };
    await deleteTodo(payload);
    expect(await readCollection("todos", { _id: todoId })).to.be.null
  });
  it("should throw error on providing invalid id", async () => {
    const payload = {
      body: {
        id: todoId
      }
    };
    try {
      await deleteTodo(payload);
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.status).to.equal(400);
      expect(err.msg).to.equal("todo id doesn't exists.Please enter valid id");
    }
  });
  afterEach(async () => {
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) {
      await deleteAllDocument("todos");
    };
  })
})
describe("deleteAllTodos", () => {
  let todoList;
  beforeEach(async () => {
    await connectDB();
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) { await deleteAllTodos("todos"); }
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        payload = {
          body: { taskName: testData.taskName },
          file: { path: path.join("utils", "assets", "img-3.jpg") }
        };
      } else {
        payload = { body: { taskName: testData.taskName } };
      }
      await createTodo(payload);
    }
  })
  it("delete all todos passes if all todos deleted successfully", async () => {
    await deleteAllTodos();
    todoList = await getAllCollection("todos");
    expect(todoList.length).to.eql(0);
  })
  it("show throw error if no todos in collection", async () => {
    try {
      await deleteAllTodos();
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.status).to.equal(400);
      expect(err.msg).to.equal("no todos in database");
    }

  })
  afterEach(async () => {
    todoList = await getAllCollection("todos");
    if (todoList.length > 0) {
      await deleteAllDocument("todos");
    };
  });
});
