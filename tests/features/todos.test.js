const chai = require("chai");
const {
  fetchingTodos,
  fetchingSingleTodo,
  createTodo,
  updateTodo,
  deleteTodo
} = require("../../features/todoList");
const {
  read,
  deleteDocument
} = require("../../services/firebase/firestore.queries");
const { connectDB } = require("../../utils/databaseConnection");
const { checkForUploadedImg } = require("../features/uploadImageCheck");
const path = require("path");
const fs = require("fs");
const expect = chai.expect;
const sampleTodoData = [
  {
    taskName: "floor cleaning"
  },
  {
    taskName: "grooming",
    image: "../../utils/assets/img-3.jpg"
  }
];

const deleteCreatedTodos = async (todoWithImageId, todoWithoutImageId) => {
  const todoIds = [todoWithImageId, todoWithoutImageId];
  for (const id of todoIds) {
    await deleteDocument.deleteDocumentById("todos", { id });
  }
};

describe("fetchingAllTodos", async () => {
  let todoList;
  let todoWithImageId;
  let todoWithoutImageId;
  beforeEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      for (const todo of todoList) {
        await deleteDocument.deleteDocumentById("todos", { id: todo.id });
      }
    }
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        fs.renameSync(
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          ),
          path.join("tmp", "uploads", testData.image.split("/")[4])
        );
        fs.copyFileSync(
          path.join("tmp", "uploads", testData.image.split("/")[4]),
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          )
        );
        payload = {
          body: { taskName: testData.taskName },
          file: {
            path: path.join("tmp", "uploads", testData.image.split("/")[4])
          }
        };
        todoWithImageId = await createTodo(payload);
      } else {
        payload = { body: { taskName: testData.taskName } };
        todoWithoutImageId = await createTodo(payload);
      }
    }
  });

  it("passess if we get the expected todo taskName and image", async () => {
    let todoTaskNameList = [];
    const getTodoCollection = await read.all("todos");
    for (const todo of getTodoCollection) {
      if (todo.image !== undefined) {
        const fileDownloadPath = path.join(
          "tests",
          "uploads",
          todo.referencePath.split("/")[2]
        );
        await checkForUploadedImg(
          fileDownloadPath,
          path.join(
            todo.image.split("/")[2],
            todo.image.split("/")[3],
            todo.image.split("/")[4]
          ),
          todo.referencePath
        );
      }
      todoTaskNameList = [...todoTaskNameList, { taskName: todo.taskName }];
    }
    const testTodosTitle = getTodoCollection.map((testTodoData) => {
      return {
        taskName: testTodoData.taskName
      };
    });
    expect(todoTaskNameList).to.have.deep.members(testTodosTitle);
  });
  it("throw error if we try to fetch empty documents from todo collection", async () => {
    try {
      await deleteCreatedTodos(todoWithImageId, todoWithoutImageId);
      await fetchingTodos();
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("No todos available please create a todo");
    }
  });
  after(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      await deleteCreatedTodos(todoWithImageId, todoWithoutImageId);
    }
  });
});

describe("fetchingTodoById", async () => {
  let todoList;
  let todoWithImageId;
  let todoWithoutImageId;
  beforeEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      for (const todo of todoList) {
        await deleteDocument.deleteDocumentById("todos", { id: todo.id });
      }
    }
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        fs.renameSync(
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          ),
          path.join("tmp", "uploads", testData.image.split("/")[4])
        );
        fs.copyFileSync(
          path.join("tmp", "uploads", testData.image.split("/")[4]),
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          )
        );
        payload = {
          body: { taskName: testData.taskName },
          file: {
            path: path.join("tmp", "uploads", testData.image.split("/")[4])
          }
        };
        todoWithImageId = await createTodo(payload);
      } else {
        payload = { body: { taskName: testData.taskName } };
        todoWithoutImageId = await createTodo(payload);
      }
    }
  });
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
    const fileDownloadPath = path.join(
      "tests",
      "uploads",
      todoDetails.referencePath.split("/")[2]
    );
    await checkForUploadedImg(
      fileDownloadPath,
      path.join(
        sampleTodoData[1].image.split("/")[2],
        sampleTodoData[1].image.split("/")[3],
        sampleTodoData[1].image.split("/")[4]
      ),
      todoDetails.referencePath
    );
  });
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
  });
  it("throw error if we enter invalid id", async () => {
    await deleteDocument.deleteDocumentById("todos", {
      id: todoWithoutImageId
    });
    const payload = {
      query: {
        id: todoWithoutImageId
      }
    };
    try {
      await fetchingSingleTodo(payload);
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal(
        "Cannot find todo with the provided id,Invalid id"
      );
    }
  });
  afterEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      const todoIds = [todoWithImageId, todoWithoutImageId];
      deleteCreatedTodos(todoIds);
    }
  });
});

describe("createTodo", () => {
  let todoList;
  let todoWithImageId;
  let todoWithoutImageId;
  beforeEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      for (const todo of todoList) {
        await deleteDocument.deleteDocumentById("todos", { id: todo.id });
      }
    }
  });
  it("create todo passes if it is created with provided payload successfully", async () => {
    for (const testData of sampleTodoData) {
      let payload;
      let todoDetails;
      if (testData.image !== undefined) {
        fs.renameSync(
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          ),
          path.join("tmp", "uploads", testData.image.split("/")[4])
        );
        fs.copyFileSync(
          path.join("tmp", "uploads", testData.image.split("/")[4]),
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          )
        );
        payload = {
          body: { taskName: testData.taskName },
          file: {
            path: path.join("tmp", "uploads", testData.image.split("/")[4])
          }
        };
        todoWithImageId = await createTodo(payload);
        todoDetails = await read.singleByKey("todos", {
          taskName: testData.taskName
        });
        expect(todoDetails.id).to.eql(todoWithImageId);
      } else {
        payload = { body: { taskName: testData.taskName } };
        todoWithoutImageId = await createTodo(payload);
        todoDetails = await read.singleByKey("todos", {
          taskName: testData.taskName
        });
        expect(todoDetails.id).to.eql(todoWithoutImageId);
      }
    }
  });
  afterEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      await deleteCreatedTodos(todoWithImageId, todoWithoutImageId);
    }
  });
});

describe("updateTodoById", async () => {
  let todoList;
  let todoWithImageId;
  let todoWithoutImageId;
  beforeEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      for (const todo of todoList) {
        await deleteDocument.deleteDocumentById("todos", { id: todo.id });
      }
    }
    for (const testData of sampleTodoData) {
      let payload;
      if (testData.image !== undefined) {
        fs.renameSync(
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          ),
          path.join("tmp", "uploads", testData.image.split("/")[4])
        );
        fs.copyFileSync(
          path.join("tmp", "uploads", testData.image.split("/")[4]),
          path.join(
            testData.image.split("/")[2],
            testData.image.split("/")[3],
            testData.image.split("/")[4]
          )
        );
        payload = {
          body: { taskName: testData.taskName },
          file: {
            path: path.join("tmp", "uploads", testData.image.split("/")[4])
          }
        };
        todoWithImageId = await createTodo(payload);
      } else {
        payload = { body: { taskName: testData.taskName } };
        todoWithoutImageId = await createTodo(payload);
      }
    }
  });
  it("should get user updated taskName when we update the task", async () => {
    const payload = {
      body: {
        taskName: "to mob",
        id: todoWithoutImageId
      }
    };

    await updateTodo(payload);
    const todoDetails = await read.singleById("todos", { id: payload.body.id });
    expect(todoDetails.taskName).to.eql(payload.body.taskName);
  });
  it("should get user updated image when we update the task", async () => {
    fs.renameSync(
      path.join("utils", "assets", "img-2.jpg"),
      path.join("tmp", "uploads", "img-2.jpg")
    );
    fs.copyFileSync(
      path.join("tmp", "uploads", "img-2.jpg"),
      path.join("utils", "assets", "img-2.jpg")
    );
    const payload = {
      body: {
        id: todoWithImageId
      },
      file: { path: path.join("tmp", "uploads", "img-2.jpg") }
    };
    await updateTodo(payload);
    const todoDetails = await read.singleById("todos", { id: payload.body.id });
    const fileDownloadPath = path.join(
      "tests",
      "uploads",
      todoDetails.referencePath.split("/")[2]
    );
    await checkForUploadedImg(
      fileDownloadPath,
      path.join("utils", "assets", "img-2.jpg"),
      todoDetails.referencePath
    );
  });
  it("throw error if we enter invalid id", async () => {
    await deleteDocument.deleteDocumentById("todos", {
      id: todoWithoutImageId
    });
    const payload = {
      body: {
        taskName: "organize the cupboard",
        id: todoWithoutImageId
      }
    };
    try {
      await updateTodo(payload);
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("todo doesn't exists");
    }
  });
  afterEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      await deleteCreatedTodos(todoWithImageId, todoWithoutImageId);
    }
  });
});
describe("deleteTodoById", () => {
  let todoId;
  let todoList;
  beforeEach(async () => {
    todoList = await read.all("todos");
    if (todoList) {
      for (const todo of todoList) {
        await deleteDocument.deleteDocumentById("todos", { id: todo.id });
      }
    }
    const payload = {
      body: {
        taskName: sampleTodoData[0].taskName
      }
    };
    todoId = await createTodo(payload);
  });
  it("delete by id should delete todo with respective id", async () => {
    const payload = {
      body: {
        id: todoId
      }
    };
    await deleteTodo(payload);
    expect(await read.singleById("todos", { id: todoId })).to.be.undefined;
  });
  it("should throw error on providing invalid id", async () => {
    const payload = {
      body: {
        id: todoId
      }
    };
    await deleteTodo(payload);
    try {
      const res = await deleteTodo(payload);
    } catch (err) {
      expect(err.name).to.equal("request error");
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("todo id doesn't exists.Please enter valid id");
    }
  });
  afterEach(async () => {
    const payload = {
      body: {
        id: todoId
      }
    };
    todoList = await read.all("todos");
    if (todoList) {
      await deleteTodo(payload);
    }
  });
});
