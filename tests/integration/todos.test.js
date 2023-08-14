const chai = require("chai");
const dotenv = require("dotenv");
const chaiHttp = require("chai-http");
const { connectDB } = require("../../utils/databaseConnection");
const { baseUrl } = require("../../utils/baseUrl");
const fs = require("fs");
const convertToBase64 = require("../../services/convertToBase64");
const apiNegative = require("../integration/apiNegative");

dotenv.config();
chai.use(chaiHttp);

const expect = chai.expect;

const testUserData = {
  userName: "testUser",
  email: "testUser11@gmail.com"
};
const testTodoDatas = [
  {
    taskName: "to watch movie",
    image: ""
  },
  {
    taskName: "to plan for next weekend",
    image: "./assets/img-1.jpg"
  }
];
async function getTodoById(requiredId, token) {
  const getTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .get("/api/todos/getTodo")
    .set({ Authorization: `Bearer ${token}` })
    .query({ id: requiredId });
  return getTodoResponse;
}

async function checkForUploadedImg(imageUrl, imgPath) {
  const base64responseUrl = convertToBase64(imageUrl);
  const base64userUploadedImg = convertToBase64(imgPath);
  expect(base64responseUrl).to.equal(base64userUploadedImg);
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
    const deleteResponse = await chai.request(baseUrl.local.SERVER_URL)
      .delete("/api/auth/deleteUser")
      .send(testUserData)
      .set({ Authorization: `Bearer ${token}` });
    expect(deleteResponse).to.equal(200);
  };
  expect(signupResponse.status).to.equal(200);
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
    .send({ email: testUserData.email })
    .set({ Authorization: `Bearer ${token}` });
  expect(deleteResponse.status).to.equal(200);
}

async function deleteTodoResponse(token) {
  const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .get("/api/todos/deleteAllTodos")
    .set({ Authorization: `Bearer ${token}` });
  expect(deleteTodoResponse.status).to.equal(200);
}

async function createTodoAndGetId(token) {
  const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .post("/api/todos/createTodo")
    .send(testTodoDatas[1])
    .type("form")
    .attach("image", fs.readFileSync(testTodoDatas[1].image), "img-1.jpg")
    .set({ Authorization: `Bearer ${token}` });
  expect(createTodoResponse.status).to.eql(200);
  const newlyCreatedTodo = await getTodoById(createTodoResponse.body.todo.id, token);
  return newlyCreatedTodo;
}
async function checkIfTokenPassed(method, url, payloadData) {
  try {
    if (method === "get") {
      if (payloadData !== null) {
        await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url)
          .send(payloadData);
        return;
      }
      await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url);
      return;
    }
    await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url)
      .send(payloadData);
  } catch (err) {
    expect(err.code).to.equal(400);
    expect(err.msg).to.equal("token is not passed");
    expect(err.name).to.equal("request error");
  }
}

describe("fetching specific todo by their id", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    let requiredId;
    let todoWithImageId;
    let todoWithoutImageId;
    beforeEach(async () => {
      await connectDB();
      // signup and getToken
      token = await createAccount(token);
      for (const todoData of testTodoDatas) {
        let createTodoResponse;
        if (todoData.image !== "") {
          createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
            .post("/api/todos/createTodo")
            .send(todoData)
            .type("form")
            .attach("image", fs.readFileSync(todoData?.image), "img-1.jpg")
            .set({ Authorization: `Bearer ${token}` });
          expect(createTodoResponse.status).to.equal(200);
          todoWithImageId = createTodoResponse.body.todo.id;
          return todoWithImageId;
        }
        createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .send(todoData)
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
        const getAllTodoResponse = await getAllTodos(token);
        expect(getAllTodoResponse.status).to.equal(200);
        todoWithoutImageId = createTodoResponse.body.todo.id;
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
      checkForUploadedImg(getTodoResponse.body.todo.imageUrl, "./assets/img-1.jpg");
    });
    it("should throw if it cannot find that particular id", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete("/api/todos/deleteTodo")
        .set({ Authorization: `Bearer ${token}` })
        .send({ id: requiredId });
      expect(deleteTodoResponse.status).to.equal(200);
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .get("/api/todos/getTodo")
          .query({ id: requiredId })
          .set({ Authorization: `Bearer ${token}` });
      }
      catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("Cannot find todo with the provided id,Invalid id");
        expect(err.name).to.equal("request error");
      }
    });
    it("form validation on entering invalid fields", async () => {
      const negativePayload = {
        url: "/api/todos/getTodo",
        method: "get",
        headers: { Authorization: `Bearer ${token}` },
        payload: { key: "id", wrongValues: ["", 123456], correctValue: requiredId }
      };

      await apiNegative(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "get",
        url: "/api/todos/getTodo",
        payload: { id: requiredId }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("fetching all todos", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    beforeEach(async () => {
      await connectDB();
      token = await createAccount(token);
      const getAllTodoResponse = await getAllTodos(token);
      expect(getAllTodoResponse.status).to.equal(200);
      if (getAllTodoResponse.body.todos.length > 0) {
        const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .delete("/api/todos/deleteTodos")
          .set({ Authorization: `Bearer ${token}` });
        expect(deleteTodoResponse.status).to.equal(200);
      }
      for (const todoData of testTodoDatas) {
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .send(todoData)
          .type("form")
          .attach("image", fs.readFileSync(todoData?.image), "img-1.jpg")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
      }
    });
    it("check if it is fetching all the todos from the db ", async () => {
      const getAllTodoResponse = await getAllTodos(token);
      const todoList = getAllTodoResponse.body.todos.map(({ id, ...rest }) => {
        return rest;
      });
      expect(todoList).to.have.deep.members(testTodoDatas);
      expect(getAllTodoResponse.status).to.equal(200);
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
    });
  });
});

describe("create todos", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    beforeEach(async () => {
      await connectDB();
      token = await createAccount(token);
    })
    it("should give expected image and title if they are added", async () => {
      for (const todoData of testTodoDatas) {
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .send(todoData)
          .type("form")
          .attach("image", fs.readFileSync(todoData?.img), todoData.image)
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
        const newTodo = await getTodoById(createTodoResponse.body.todo.id, token);
        expect(newTodo.body.todo.taskName).to.equal(todoData.taskName);
        if (todoData.image !== "") {
          checkForUploadedImg(createTodoResponse.body.todo.imageUrl, "./assets/img-1.jpg");
        };
      };
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "post",
        url: "/api/todos/createTodo",
        payload: { taskName: testTodoDatas[0] }
      };
      await checkIfTokenPassed("post", "/api/todos/createTodo", tokenValidationPayload);
    });
    after(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("update todos", () => {
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
        .send({ taskName: "clean desk", id: newlyCreatedTodo.id })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.id, token);
      expect(getUpdatedTodo.body.todo.taskName).to.eql("clean desk");
    });
    it("should have correct data when image is updated while title is not updated", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch("/api/todos/updateTodo")
        .type("form")
        .send({ id: newlyCreatedTodo.id })
        .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.id, token);
      checkForUploadedImg(getUpdatedTodo?.body?.todo?.imageUrl, "./assets/img-2.jpg");
    });
    it("form validation on entering invalid fields", async () => {
      const payloadData = [
        { key: "id", wrongValues: ["", 123456], correctValue: newlyCreatedTodo.id },
        { key: "taskName", wrongValues: [], correctValue: "clean desk" }
      ];
      const negativePayload = {
        url: "/api/todos/updateTodo",
        method: "patch",
        headers: { Authorization: `Bearer ${token}` },
        payload: payloadData
      };
      await apiNegative(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "patch",
        url: "/api/todos/updateTodo",
        payload: { taskName: "get ready to watch movie", id: newlyCreatedTodo.id }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("delete todo by id", () => {
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
        .send({ id: newlyCreatedTodo.id });
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
        payload: { key: "id", wrongValues: ["", 123456], correctValue: newlyCreatedTodo.id }
      };
      await apiNegative(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "delete",
        url: "/api/todos/deleteTodo",
        payload: { id: newlyCreatedTodo.id }
      };
      await checkIfTokenPassed(tokenValidationPayload);
    });
    afterEach(async () => {
      await deleteUserAccount(token);
      await deleteTodoResponse(token);
    });
  });
});

describe("delete all todos", () => {
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
        const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
          .post("/api/todos/createTodo")
          .send(todoData)
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
      };
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
