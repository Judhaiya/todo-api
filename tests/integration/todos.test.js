const chai = require("chai");
const dotenv = require("dotenv");
const chaiHttp = require("chai-http");
const { connectDB } = require("../../utils/databaseConnection");
const { baseUrl } = require("../../utils/baseUrl");
const fs = require("fs");
const { checkForUploadedImg } = require("../features/uploadImageCheck");
const { apiNegative } = require("../integration/apiNegative");
const path = require("path");


dotenv.config();
chai.use(chaiHttp);

const expect = chai.expect;

const testUserData = {
  userName: "testUser",
  email: "testUser11@gmail.com",
  password: "testUser123"
};
const testTodoDatas = [
  {
    taskName: "to watch movie"
  },
  {
    taskName: "to plan for next weekend",
    image: "../../utils/assets/img-1.jpg"
  }
];
async function getTodoById(requiredId, token) {
  const getTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .get("/api/todos/getSingleTodo")
    .set({ Authorization: `Bearer ${token}` })
    .query({ id: requiredId });
  return getTodoResponse;
}

async function createAccount(token) {
  const signupResponse = await chai.request(baseUrl.local.SERVER_URL)
    .post("/api/auth/signup")
    .send(testUserData);
  if (signupResponse.body.msg === "User email already exists") {
    const loginResponse = await chai.request(baseUrl.local.SERVER_URL)
      .post("/api/auth/login")
      .send(testUserData);
    expect(loginResponse.status).to.equal(200);
    token = loginResponse.body.token;
    return token;
  };
  token = signupResponse.body.token;
  return token;
};

async function getAllTodos(token) {
  const getAllTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .get("/api/todos/getAllTodos")
    .set({ Authorization: `Bearer ${token}` });
  return getAllTodoResponse;
}

async function deleteUserAccount(token) {
  const deleteResponse = await chai.request(baseUrl.local.SERVER_URL)
    .delete("/api/auth/deleteUser")
    .send({ email: testUserData.email, password: testUserData.password })
    .set({ Authorization: `Bearer ${token}` });
  expect(deleteResponse.status).to.equal(200);
}

async function deleteTodoResponse(token) {
  const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .delete("/api/todos/deleteAllTodos")
    .set({ Authorization: `Bearer ${token}` });
  expect(deleteTodoResponse.status).to.equal(200);
}

async function createTodoAndGetId(token) {
  const filePath = path.join(testTodoDatas[1].image.split("/")[2], testTodoDatas[1].image.split("/")[3], testTodoDatas[1].image.split("/")[4]);
  const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .post("/api/todos/createTodo")
    .field({ taskName: testTodoDatas[1].taskName })
    .type("form")
    .attach("image", fs.readFileSync(filePath), filePath)
    .set({ Authorization: `Bearer ${token}` });
  expect(createTodoResponse.status).to.eql(200);
  const newlyCreatedTodo = await getTodoById(createTodoResponse.body.todoId, token);
  return newlyCreatedTodo;
}
async function checkIfTokenPassed(payloadData) {
  const { method, url, payload } = payloadData;
  if (method === "get") {
    if (payload !== null) {
      const res = await chai.request(baseUrl.local.SERVER_URL).get(url)
        .send(payloadData);
      expect(res.status).to.equal(400);
      expect(res.body.msg).to.equal("jwt must be provided");
      return;
    }
    const res = await chai.request(baseUrl.local.SERVER_URL).get(url);
    expect(res.status).to.equal(400);
    expect(res.body.msg).to.equal("jwt must be provided");
  }
  const res = await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url)
    .send(payloadData);
  expect(res.status).to.equal(400);
  expect(res.body.msg).to.equal("jwt must be provided");
}

describe("fetchingTodoById", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    let todoWithImageId;
    let todoWithoutImageId;
    beforeEach(async () => {
      await connectDB();
      // signup and getToken
      token = await createAccount(token);
      for (const todoData of testTodoDatas) {
        if (todoData.image !== undefined) {
          const filePath = path.join(todoData.image.split("/")[2], todoData.image.split("/")[3], todoData.image.split("/")[4]);
          const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
            .post("/api/todos/createTodo")
            .field({ taskName: todoData.taskName })
            .type("form")
            .attach("image", fs.readFileSync(filePath), filePath)
            .set({ Authorization: `Bearer ${token}` });
          expect(createTodoResponse.status).to.equal(200);
          todoWithImageId = createTodoResponse.body.todoId;
          return todoWithImageId;
        }
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .field({ taskName: todoData.taskName })
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
        todoWithoutImageId = createTodoResponse.body.todoId;
      }
    });
    it("should give the expected title", async () => {
      const getTodoWithImageResponse = await getTodoById(todoWithImageId, token);
      const getTodoWithoutImageResponse = await getTodoById(todoWithoutImageId, token);
      expect(getTodoWithImageResponse.status).to.equal(200);
      expect(getTodoWithImageResponse.body.todo.taskName).to.equal(testTodoDatas[1].taskName);
      expect(getTodoWithImageResponse.body.todo.isCompleted).to.be.false
      expect(getTodoWithoutImageResponse.status).to.equal(200);
      expect(getTodoWithoutImageResponse.body.todo.taskName).to.equal(testTodoDatas[0].taskName);
      expect(getTodoWithoutImageResponse.body.todo.isCompleted).to.be.false
    });
    it("should give the expected image", async () => {
      const getTodoResponse = await getTodoById(todoWithImageId, token);
      expect(getTodoResponse.body.todo.taskName).to.equal(testTodoDatas[1].taskName);
      const fileDownloadPath = path.join("tests", "uploads", getTodoResponse.body.todo.referencePath.split("/")[2]);
      await checkForUploadedImg(fileDownloadPath, path.join(testTodoDatas[1].image.split("/")[2], testTodoDatas[1].image.split("/")[3], testTodoDatas[1].image.split("/")[4]),
        getTodoResponse.body.todo.referencePath);
    });
    it("should throw if it cannot find that particular id", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete("/api/todos/deleteTodo")
        .set({ Authorization: `Bearer ${token}` })
        .send({ id: todoWithoutImageId });
      expect(deleteTodoResponse.status).to.equal(200);
      expect(deleteTodoResponse.body.msg).to.equal("todo has been deleted successfully");
      const res = await chai.request(baseUrl.local.SERVER_URL)
        .get("/api/todos/getSingleTodo")
        .query({ id: todoWithoutImageId })
        .set({ Authorization: `Bearer ${token}` });
      expect(res.body.msg).to.equal("Cannot find todo with the provided id,Invalid id");
      expect(res.status).to.equal(400);
    });
    it("form validation on entering invalid fields", async () => {
      const negativePayload = {
        url: "/api/todos/getSingleTodo",
        method: "get",
        headers: { Authorization: `Bearer ${token}` },
        payloadDetails: [{ key: "id", wrongValues: ["", 123456], correctValue: todoWithoutImageId }]
      };

      await apiNegative(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "get",
        url: "/api/todos/getSingleTodo",
        payload: { id: todoWithoutImageId }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("fetchingAllTodos", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    beforeEach(async () => {
      await connectDB();
      token = await createAccount(token);
      const getAllTodoResponse = await getAllTodos(token);
      if (getAllTodoResponse.body.todos !== undefined) {
        await deleteTodoResponse(token);
      }
      for (const todoData of testTodoDatas) {
        if (todoData.image !== undefined) {
          const filePath = path.join(todoData.image.split("/")[2], todoData.image.split("/")[3], todoData.image.split("/")[4]);
          const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
            .post("/api/todos/createTodo")
            .field(todoData)
            .type("form")
            .attach("image", fs.readFileSync(filePath), filePath)
            .set({ Authorization: `Bearer ${token}` });
          expect(createTodoResponse.status).to.equal(200);
          return;
        }
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .field({ taskName: todoData.taskName })
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
      };
    });
    it("check if it is fetching all the todos from the db ", async () => {
      const getAllTodoResponse = await getAllTodos(token);
      const todoList = getAllTodoResponse.body.todos.map(({ taskName }) => {
        return { taskName };
      });
      const testTodosTitle = testTodoDatas.map(testTodoData => {
        return {
          taskName: testTodoData.taskName
        };
      });
      expect(getAllTodoResponse.status).to.equal(200);
      expect(todoList).to.have.deep.members(testTodosTitle);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "get",
        url: "/api/todos/getAllTodos",
        payload: null
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("createTodos", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    beforeEach(async () => {
      await connectDB();
      token = await createAccount(token);
    })
    it("should give expected image and title if they are added", async () => {
      for (const todoData of testTodoDatas) {
        if (todoData.image !== undefined) {
          const filePath = path.join(todoData.image.split("/")[2], todoData.image.split("/")[3], todoData.image.split("/")[4]);
          const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
            .post("/api/todos/createTodo")
            .field(todoData)
            .type("form")
            .attach("image", fs.readFileSync(filePath), filePath)
            .set({ Authorization: `Bearer ${token}` });
          expect(createTodoResponse.status).to.equal(200);
          const newTodo = await getTodoById(createTodoResponse.body.todoId, token);
          const fileDownloadPath = path.join("tests", "uploads", newTodo.body.todo.referencePath.split("/")[2]);
          await checkForUploadedImg(fileDownloadPath, path.join("utils", "assets", "img-1.jpg"), newTodo.body.todo.referencePath);
          expect(newTodo.body.todo.taskName).to.equal(todoData.taskName);
          return;
        }
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .field({ taskName: todoData.taskName })
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
        const newTodo = await getTodoById(createTodoResponse.body.todoId, token);
        expect(newTodo.body.todo.taskName).to.equal(todoData.taskName);
      };
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "post",
        url: "/api/todos/createTodo",
        payload: { taskName: testTodoDatas[0] }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("updateTodoById", () => {
  describe("test cases will be passed in the below scenarios", async () => {
    let token;
    let newlyCreatedTodo;
    beforeEach(async () => {
      await connectDB();
      token = await createAccount(token);
      newlyCreatedTodo = await createTodoAndGetId(token);
    });
    it("should have correct data when taskname is updated while image is not updated", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch("/api/todos/updateTodo")
        .field({ taskName: "clean desk", id: newlyCreatedTodo.body.todo.id })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.body.todo.id, token);
      expect(getUpdatedTodo.body.todo.taskName).to.eql("clean desk");
    });
    it("should have correct data when image is updated while title is not updated", async () => {
      const filePath = path.join("utils", "assets", "img-2.jpg");
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch("/api/todos/updateTodo")
        .type("form")
        .field({ id: newlyCreatedTodo.body.todo.id })
        .attach("image", fs.readFileSync(filePath), filePath)
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.body.todo.id, token);
      const fileDownloadPath = path.join("tests", "uploads", getUpdatedTodo.body.todo.referencePath.split("/")[2]);
      await checkForUploadedImg(fileDownloadPath, filePath, getUpdatedTodo.body.todo.referencePath);
    });
    it("form validation on entering invalid fields", async () => {
      const payloadData = [
        { key: "id", wrongValues: ["", 123456], correctValue: newlyCreatedTodo.body.todo.id },
        { key: "taskName", wrongValues: [], correctValue: "clean desk" }
      ];
      const negativePayload = {
        url: "/api/todos/updateTodo",
        method: "patch",
        headers: { Authorization: `Bearer ${token}` },
        payloadDetails: payloadData
      };
      await apiNegative(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "patch",
        url: "/api/todos/updateTodo",
        payload: { taskName: testTodoDatas[0].taskName, id: newlyCreatedTodo.body.todo.id }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("deleteTodoById", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    let newlyCreatedTodo;
    beforeEach(async () => {
      await connectDB();
      token = await createAccount(token);
      newlyCreatedTodo = await createTodoAndGetId(token);
    });
    it("should delete todo if valid id is provided", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete("/api/todos/deleteTodo")
        .set({ Authorization: `Bearer ${token}` })
        .send({ id: newlyCreatedTodo.body.todo.id });
      expect(deleteTodoResponse.status).to.equal(200);
    });
    it("should throw 400 if invalid id is provided", async () => {
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .delete("/api/todos/deleteTodo")
          .set({ Authorization: `Bearer ${token}` })
          .send({ id: 1234 });
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("invalid id");
        expect(err.name).to.equal("request error");
      }
    });
    it("form validation on entering invalid fields", async () => {
      const negativePayload = {
        url: "/api/todos/deleteTodo",
        method: "delete",
        headers: { Authorization: `Bearer ${token}` },
        payloadDetails: [{ key: "id", wrongValues: ["", 12345], correctValue: newlyCreatedTodo.body.todo.id }]
      };
      await apiNegative(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "delete",
        url: "/api/todos/deleteTodo",
        payload: { id: newlyCreatedTodo.body.todo.id }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("deleteAllTodos", () => {
  describe("test cases will be passed in the below scenario", () => {
    let token;
    before(async () => {
      await connectDB();
      token = await createAccount(token);
      const getAllTodoResponse = await getAllTodos(token);
      expect(getAllTodoResponse.status).to.equal(200);
      if (getAllTodoResponse.body.todos.length > 0) {
        const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .delete("/api/todos/deleteAllTodos")
          .set({ Authorization: `Bearer ${token}` });
        expect(deleteTodoResponse.status).to.equal(200);
      }
      for (const todoData of testTodoDatas) {
        if (todoData.image !== undefined) {
          const filePath = path.join(todoData.image.split("/")[2], todoData.image.split("/")[3], todoData.image.split("/")[4]);
          const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
            .post("/api/todos/createTodo")
            .field({ taskName: todoData.taskName })
            .type("form")
            .attach("image", fs.readFileSync(filePath), filePath)
            .set({ Authorization: `Bearer ${token}` });
          expect(createTodoResponse.status).to.equal(200);
        }
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .field({ taskName: todoData.taskName })
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
      }
    });
    it("delete all the todos", async () => {
      await deleteTodoResponse(token);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "delete",
        url: "/api/todos/deleteAllTodos",
        payload: null
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    after(async () => {
      await deleteUserAccount(token);
      const getAllTodoResponse = await getAllTodos(token);
      expect(getAllTodoResponse.status).to.equal(200);
      if (getAllTodoResponse.body.todos.length > 0) {
        await deleteTodoResponse(token);
      }
    });
  });
});
