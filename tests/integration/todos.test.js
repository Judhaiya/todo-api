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
    .get(`/api/todos/getTodos/:${requiredId}`)
    .set({ Authorization: `Bearer ${token}` });
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
    .send(testTodoData)
    .type("form")
    .attach("image", fs.readFileSync("./assets/img-1.jpg"), "img-1.jpg")
    .set({ Authorization: `Bearer ${token}` });
  expect(createTodoResponse.status).to.eql(200);
  const newlyCreatedTodo = await getTodoById(createTodoResponse.body.todo.id, token);
  return newlyCreatedTodo;
}
async function checkIfTokenPassed(method, url, payloadData) {
  try {
    if (method === "get") {
      await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url);
      return;
    }
    await chai.request(baseUrl.local.SERVER_URL)[`${method}`](url)
      .send(payloadData)
      .type("form");
  } catch (err) {
    expect(err.code).to.equal(400);
    expect(err.msg).to.equal("token is not passed");
    expect(err.name).to.equal("request error");
  }
}
async function formValidation(negativePayload) {
  const { url, method, headers, payload } = negativePayload;
  const invalidIds = ["1234", ""];
  const path = url?.split("/")[3];
  for (const id of invalidIds) {
    try {
      if (method === "patch") {
        await chai.request(baseUrl.local.SERVER_URL)[`${method}`](`/api/todos/${path}/:${id}`)
          .set(headers)
          .send(payload)
          .type("form");
        return;
      }
      await chai.request(baseUrl.local.SERVER_URL)[`${method}`](`/api/todos/${path}/:${id}`)
        .set(headers);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.name).to.equal("request error");
      expect(err.msg).to.equal("Invalid id");
    }
  }
}
describe("fetching specific todo by their id", () => {
  describe("test cases will be passed in the below scenarios", () => {
    let token;
    let requiredId;
    beforeEach(async () => {
      await connectDB();
      // signup and getToken
      token = await createAccount(token);
      const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .send(testTodoData)
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(createTodoResponse.status).to.equal(200);
      requiredId = createTodoResponse.body.todo.id;
    });
    it("should give the expected title", async () => {
      const getTodoResponse = await getTodoById(requiredId, token);
      expect(getTodoResponse.status).to.equal(200);
      expect(getTodoResponse.body.todo.taskName).to.equal(testTodoData.name);
      expect(getTodoResponse.body.todo.isCompleted).to.be.false
    });
    it("should give the expected image", async () => {
      const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .type("form")
        .send({ taskName: testTodoData.taskName })
        .set({ Authorization: `Bearer ${token}` })
        .attach("image", fs.readFileSync("./assets/img-1.jpg"), "img-1.jpg");
      expect(createTodoResponse.status).to.equal(200);
      const getTodoResponse = await getTodoById(createTodoResponse.body.todo.id, token);
      expect(getTodoResponse.body.todo.taskName).to.equal(testTodoData.taskName);
      checkForUploadedImg(getTodoResponse.body.todo.imageUrl, "./assets/img-1.jpg");
    });
    it("should give expected img after updation", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .type("form")
        .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.statusCode).to.equal(200);
      const getTodoResponse = await getTodoById(requiredId, token);
      checkForUploadedImg(getTodoResponse.body.todo.imageUrl, "./assets/img-2.jpg");
    });
    it("should give expected title after updation", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .send({ taskName: "clean house" })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.equal(200);
      const getTodoResponse = await getTodoById(requiredId, token);
      expect(getTodoResponse.body.todo.taskName).to.equal("clean house");
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
      expect(getTodoResponse.body.todo.taskName).to.equal("to get ready for outing");
      checkForUploadedImg(getTodoResponse.body.todo.imageUrl, "./assets/img-3.jpg");
    });
    it("should throw if it cannot find that particular id", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete(`/api/todos/Todo/:${requiredId}`)
        .set({ Authorization: `Bearer ${token}` });
      expect(deleteTodoResponse.status).to.equal(200);
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .get(`/api/todos/getTodo/:${requiredId}`)
          .set({ Authorization: `Bearer ${token}` });
      }
      catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("Invalid todo Id");
        expect(err.name).to.equal("request error");
      }
    });
    it("form validation on entering invalid fields", async () => {
      const negativePayload = {
        url: `/api/todos/getTodo/:${requiredId}`,
        method: "get",
        headers: { Authorization: `Bearer ${token}` },
        payload: ""
      };

      await formValidation(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      const tokenValidationPayload = {
        method: "get",
        url: `/api/todos/getTodo/:${requiredId}`,
        payload: ""
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
        payload: ""
      }
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
      await checkIfTokenPassed("post", "/api/todos/createTodo", testTodoData);
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
      newlyCreatedTodo = createTodoAndGetId(token);
    });
    it("should have correct data when taskname is updated while image is not updated", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${newlyCreatedTodo.id}`)
        .send({ taskName: "clean desk" })
        .type("form")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.id, token);
      expect(getUpdatedTodo.body.todo.taskName).to.eql("clean desk");
    });
    it("should have correct data when image is updated while title is not updated", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${newlyCreatedTodo.id}`)
        .type("form")
        .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.eql(200);
      const getUpdatedTodo = await getTodoById(newlyCreatedTodo.id, token);
      checkForUploadedImg(getUpdatedTodo?.body?.todo?.imageUrl, "./assets/img-2.jpg");
    });
    it("form validation on entering invalid fields", async () => {
      const negativePayload = {
        url: `/api/todos/updateTodo/:${newlyCreatedTodo}`,
        method: "patch",
        headers: { Authorization: `Bearer ${token}` },
        payload: { taskName: "clean desk" }
      };
      await formValidation(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      await checkIfTokenPassed("patch", `/api/todos/updateTodo/:${newlyCreatedTodo.id}`, { taskName: "get ready to watch movie" });
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
      newlyCreatedTodo = createTodoAndGetId(token);
    });
    it("should delete todo if valid id is provided", async () => {
      const deleteTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .delete(`/api/todos/deleteTodo/:${newlyCreatedTodo.id}`)
        .set({ Authorization: `Bearer ${token}` });
      expect(deleteTodoResponse.status).to.equal(200);
    });
    it("should throw 400 if invalid id is provided", async () => {
      try {
        await chai.request(baseUrl.local.SERVER_URL)
          .delete("/api/todos/deleteTodo/1234")
          .set({ Authorization: `Bearer ${token}` });
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.msg).to.equal("invalid id");
        expect(err.name).to.equal("request error");
      }
    });
    it("form validation on entering invalid fields", async () => {
      const negativePayload = {
        url: `/api/todos/deleteTodo/:${newlyCreatedTodo.id}`,
        method: "delete",
        headers: { Authorization: `Bearer ${token}` },
        payload: ""
      };
      await formValidation(negativePayload);
    });
    it("throw error if token is not passed", async () => {
      await checkIfTokenPassed("delete", `/api/todos/deleteTodo/:${newlyCreatedTodo.id}`);
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
          .set({ Authorization: `Bearer ${token}` });
        expect(createTodoResponse.status).to.equal(200);
      };
    });
    it("delete all the todos", async () => {
      await deleteTodoResponse(token);
    });
    it("throw error if token is not passed", async () => {
      await checkIfTokenPassed("delete", "/api/todos/deleteAllTodos");
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
