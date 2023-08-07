const chai = require("chai");
const dotenv = require("dotenv");
const chaiHttp = require("chai-http");
const { connectDB } = require("../../utils/databaseConnection");
const { baseUrl } = require("../../utils/baseUrl");
const fs = require("fs");
const convertToBase64 = require("../../services/convertToBase64");

dotenv.config();
chai.use(chaiHttp);
const expect = chai.expect;

const testTodoData = {
  taskName: "to bake"
};
const testUserData = {
  userName: "testUser",
  email: "testUser11@gmail.com"
};
async function formValidation(invalidIds, token) {
  for (const id of invalidIds) {
    try {
      await chai.request(baseUrl.local.SERVER_URL)
        .get(`/api/todos/getTodos/:${id}`)
        .set({ Authorization: `Bearer ${token}` });
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.name).to.equal("request error");
    }
  }
}
async function getTodoById(requiredId, token) {
  const getTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
    .get(`/api/todos/getTodos/:${requiredId}`)
    .set({ Authorization: `Bearer ${token}` });
  return getTodoResponse;
}

async function checkForUploadedImg(imageUrl, imgPath) {
  const base64responseUrl = convertToBase64(imageUrl);
  const base64userUploadedImg = convertToBase64(imgPath);
  expect(base64responseUrl).to.equal(base64userUploadedImg);
}

async function createOrLoginAccount(token) {
  const signupResponse = await chai.request(baseUrl.local.SERVER_URL)
    .post("/api/auth/signup")
    .send(testUserData);
  if (signupResponse.body.msg === "User email already exists") {
    const loginResponse = await chai.request(baseUrl.local.SERVER_URL)
      .post("/api/auth/login")
      .send(testUserData);
    token = loginResponse.body.token;
    expect(signupResponse.status).to.equal(200);
    return;
  }
  expect(signupResponse.status).to.equal(200);
  token = signupResponse.body.token;
  return token;
}

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
    .send(testTodoData)
    .type("form")
    .attach("image", fs.readFileSync("./assets/img-1.jpg"), "img-1.jpg")
    .set({ Authorization: `Bearer ${token}` });
  expect(createTodoResponse.status).to.eql(200);
  const getAllTodoResponse = await getAllTodos(token);
  const newlyCreatedTodo = getAllTodoResponse.body.todos.find(todo => todo.taskName === testTodoData.taskName);
  return newlyCreatedTodo;
}
describe("fetching specific todo by their id", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    let requiredId;
    beforeEach(async () => {
      await connectDB();
      // signup and getToken
      token = await createOrLoginAccount(token);
      const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .send(testTodoData)
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(createTodoResponse.status).to.equal(200);
      const getAllTodosResponse = await chai.request(baseUrl.local.SERVER_URL)
        .get("/api/todos/getAllTodos");
      const allTodos = getAllTodosResponse.body.todos;
      requiredId = allTodos.find(todo => todo.taskName === testTodoData.taskName).id;
    });
    it("should give the expected title", async () => {
      const getTodoResponse = await getTodoById(requiredId, token);
      expect(getTodoResponse.status).to.equal(200);
      expect(getTodoResponse.body.todos[0].taskName).to.equal(testTodoData.name);
      expect(getTodoResponse.body.todos[0].isCompleted).to.be.false
    });
    it("should give the expected image", async () => {
      const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .type("form")
        .send({ taskName: testTodoData.taskName })
        .set({ Authorization: `Bearer ${token}` })
        .attach("image", fs.readFileSync("./assets/img-1.jpg"), "img-1.jpg");
      expect(createTodoResponse.status).to.equal(200);
      const getTodoResponse = await getTodoById(requiredId, token);
      expect(getTodoResponse.body.todos[0].taskName).to.equal(testTodoData.taskName);
      checkForUploadedImg(getTodoResponse.body.todos[0].imageUrl, "./assets/img-1.jpg");
    });
    it("should give expected img after updation", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .type("form")
        .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.statusCode).to.equal(200);
      const getTodoResponse = await getTodoById(requiredId, token);
      checkForUploadedImg(getTodoResponse.body.todos[0].imageUrl, "./assets/img-2.jpg");
    });
    it("should give expected title after updation", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .send({ taskName: "clean house" })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.equal(200);
      const getTodoResponse = await getTodoById(requiredId, token);
      expect(getTodoResponse.taskName).to.equal("clean house");
    });
    it("should give expected img and expected title after updation of title and img", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .send({ taskName: "to get ready for outing" })
        .type("form")
        .attach("image", fs.readFileSync("./assets/img-3.jpg"), "img-3.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.statusCode).to.equal(200);
      const getTodoResponse = await getTodoById(requiredId, token);
      expect(getTodoResponse.taskName).to.equal("to get ready for outing");
      checkForUploadedImg(getTodoResponse.body.todos[0].imageUrl, "./assets/img-3.jpg");
    });
    it("should throw if it cannot find that particular id", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete(`/api/todos/Todo/:${requiredId}`)
        .set({ Authorization: `Bearer ${token}` });
      expect(deleteTodoResponse.status).to.equal(200);
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .get(`/api/todos/getTodos/:${requiredId}`)
          .set({ Authorization: `Bearer ${token}` });
      }
      catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("Invalid todo Id");
        expect(err.name).to.equal("request error");
      }
    });
    it("form validation on entering invalid fields", async () => {
      const invalidIds = [1234, ""];
      formValidation(invalidIds, token);
    });
    afterEach(async () => {
      deleteUserAccount(token);
      deleteTodoResponse(token);
    });
  });
});

describe("fetching all todos", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    const testTodoDatas = [
      {
        taskName: "to watch movie"
      },
      {
        taskName: "to plan for next weekend"
      }
    ];
    beforeEach(async () => {
      await connectDB();
      token = await createOrLoginAccount(token);
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

    it("check if it is fetching all the updated image", async () => {
      let getAllTodoResponse;
      getAllTodoResponse = await getAllTodos(token);
      const getFirstTodo = getAllTodoResponse.body.todos.find(todo => todo.taskName === testTodoDatas[0]?.taskName);
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${getFirstTodo.id}`)
        .attach("image", fs.readFileSync("./assets/img-3.jpg"), "img-3.jpg")
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.equal(200);
      getAllTodoResponse = await getAllTodos(token);
      const updatedTodo = getAllTodoResponse.body.todos.find(todo => todo.id === getFirstTodo.id);
      checkForUploadedImg(updatedTodo.imageUrl, "./assets/img-3.jpg");
    });
    it("check if it is fetching all the updated image", async () => {
      let getAllTodoResponse;
      getAllTodoResponse = await getAllTodos(token);
      const getFirstTodo = getAllTodoResponse.body.todos.find(todo => todo.taskName === testTodoDatas[0]?.taskName);
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${getFirstTodo.id}`)
        .send({ taskName: "clean desk" })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.equal(200);
      getAllTodoResponse = await getAllTodos(token);
      const updatedTodo = getAllTodoResponse.body.todos.find(todo => todo.id === getFirstTodo.id);
      expect(updatedTodo.taskName).to.equal("clean desk");
    });
    afterEach(async () => {
      deleteUserAccount(token);
    });
  });
});

describe("create todos", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    beforeEach(async () => {
      await connectDB();
      token = await createOrLoginAccount(token);
    })
    it("if the todo is added successfully", async () => {
      const todoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .type("form")
        .send(testTodoData)
        .set({ Authorization: `Bearer ${token}` });
      expect(todoResponse.status).to.eql(200);
      const getAllTodoResponse = await getAllTodos(token);
      expect(getAllTodoResponse.body.todos).to.deep.include({ taskName: "to bake" });
    });
    it("if the todo is added successfully with image", async () => {
      const todoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .type("form")
        .send(testTodoData)
        .attach("image", fs.readFileSync("./assets/img-1.jpg"), "img-1.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(todoResponse.status).to.eql(200);
      const getAllTodoResponse = await getAllTodos(token);
      expect(getAllTodoResponse.body.todos).to.deep.include({ taskName: "to bake" });
      const newlyCreatedTodo = getAllTodoResponse.body.todos.find(todo => todo.taskName === testTodoData.taskName);
      checkForUploadedImg(newlyCreatedTodo.imageUrl, "./assets/img-1.jpg");
    });
    after(async () => {
      deleteUserAccount(token);
      deleteTodoResponse(token);
    });
  });
});

describe("update todos", () => {
  describe("test cases will be passed in the below scenarios", async () => {
    let token;
    let newlyCreatedTodo;
    beforeEach(async () => {
      await connectDB();
      token = await createOrLoginAccount(token);
      newlyCreatedTodo = createTodoAndGetId(token);
    });
    it("if todo title is updated successfully", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${newlyCreatedTodo.id}`)
        .send({ taskName: "clean desk" })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.id);
      expect(getUpdatedTodo.body.todo.taskName).to.eql("clean desk");
    });
    it("if todo image is updated successfully", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${newlyCreatedTodo.id}`)
        .type("form")
        .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getAllTodoResponse = await getAllTodos(token);
      newlyCreatedTodo = getAllTodoResponse.body.todos.find(todo => todo.taskName === testTodoData.taskName);
      checkForUploadedImg(newlyCreatedTodo.imageUrl, "./assets/img-2.jpg");
    });
    it("it should throw 400 if we try to update with same todo", async () => {
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .patch(`/api/todos/updateTodo/:${newlyCreatedTodo.id}`)
          .send(testTodoData)
          .type("form")
          .set({ Authorization: `Bearer ${token}` });
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("Taskname not changed.Please enter different taskname");
        expect(err.name).to.equal("request error");
      }
    });
    it("it should throw 400 if we try to update with same image", async () => {
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .patch(`/api/todos/updateTodo/:${newlyCreatedTodo.id}`)
          .send(testTodoData)
          .type("form")
          .set({ Authorization: `Bearer ${token}` })
          .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("photo not changed.Please upload different photo");
        expect(err.name).to.equal("request error");
      }
    });
    afterEach(async () => {
      deleteUserAccount(token);
      deleteTodoResponse(token);
    });
  });
});

describe("delete todo by id", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    let newlyCreatedTodo;
    beforeEach(async () => {
      await connectDB();
      token = await createOrLoginAccount(token);
      newlyCreatedTodo = createTodoAndGetId(token);
    });
    it("should delete todo if valid id is provided", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete(`/api/todos/Todo/:${newlyCreatedTodo.id}`)
        .set({ Authorization: `Bearer ${token}` });
      expect(deleteTodoResponse.status).to.equal(200);
    });
    it("should throw 400 if invalid id is provided", async () => {
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .delete("/api/todos/Todo/1234")
          .set({ Authorization: `Bearer ${token}` });
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("invalid id");
        expect(err.name).to.equal("request error");
      }
    })
    afterEach(async () => {
      deleteUserAccount(token);
      deleteTodoResponse(token);
    });
  });
});

describe("delete all todos", () => {
  describe("test cases will be passed in the below scenario", () => {
    let token;
    const testTodoDatas = [
      {
        taskName: "to watch movie"
      },
      {
        taskName: "to plan for next weekend"
      }
    ];
    before(async () => {
      await connectDB();
      token = await createOrLoginAccount(token);
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
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
      }
    })
    it("delete all the todos", async () => {
      deleteTodoResponse(token);
    });
    after(async () => {
      deleteUserAccount(token);
      const getAllTodoResponse = await getAllTodos(token);
      expect(getAllTodoResponse.status).to.equal(200);
      if (getAllTodoResponse.body.todos.length > 0) {
        deleteTodoResponse(token);
      }
    });
  });
});