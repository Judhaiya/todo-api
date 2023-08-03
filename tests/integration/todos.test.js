const chai = require("chai");
const dotenv = require("dotenv");
const chaiHttp = require("chai-http");
const { readCollection } = require("../../services/mongodb/actionFunctions");
const { connectDB } = require("../../utils/databaseConnection");
const { baseUrl } = require("../../utils/baseUrl");
const fs = require("fs");
const convertToBase64 = require("../../services/convertToBase64")

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

describe("fetching specific todo works", () => {
  describe("if it fetches todo by id", () => {
    let token;
    let requiredId;
    beforeEach(async () => {
      connectDB();
      // signup and getToken

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
      const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .send(testTodoData)
        .set({ Authorization: `Bearer ${token}` });
      expect(createTodoResponse.status).to.equal(200);
      const getAllTodosResponse = await chai.request(baseUrl.local.SERVER_URL)
        .get("/api/todos/getAllTodos");
      const allTodos = getAllTodosResponse.body.todos;
      requiredId = allTodos.find(todo => todo.taskName === testTodoData.taskName).id;
    });
    it("and gives expected title", async () => {
      const getTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .get("/api/todos/getTodos/:id")
        .set({ Authorization: `Bearer ${token}` });
      expect(getTodoResponse.status).to.equal(200);
      expect(getTodoResponse.body.todos[0].taskName).to.equal(testTodoData.name);
      expect(getTodoResponse.body.todos[0].isCompleted).to.be.false
    });
    it("gives expected img", async () => {
      const createTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .post("/api/todos/createTodo")
        .field({ taskName: testTodoData.taskName })
        .set({ Authorization: `Bearer ${token}` })
        .attach("image", fs.readFileSync("./assets/img-1.jpg"), "img-1.jpg");
      expect(createTodoResponse.status).to.equal(200);
      const getTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .get(`/api/todos/getTodos/:${requiredId}`)
        .set({ Authorization: `Bearer ${token}` });
      expect(getTodoResponse.body.todos[0].taskName).to.equal(testTodoData.taskName);
      const imageUrl = getTodoResponse.body.todos[0]?.imgUrl;
      const base64responseUrl = convertToBase64(imageUrl);
      const base64userUploadedImg = convertToBase64("./assets/img-1.jpg");
      expect(base64responseUrl).to.equal(base64userUploadedImg);
    });
    it("and gives expected img after updation", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .attach("image", fs.readFileSync("./assets/img-2.jpg"), "img-2.jpg")
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.statusCode).to.equal(200);
      const getTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .get(`/api/todos/getTodos/:${requiredId}`)
        .set({ Authorization: `Bearer ${token}` });
      const imageUrl = getTodoResponse.body.todos[0]?.imgUrl;
      const base64responseUrl = convertToBase64(imageUrl);
      const base64userUploadedImg = convertToBase64("./assets/img-2.jpg");
      expect(base64responseUrl).to.equal(base64userUploadedImg);
    })
    it("and gives expected title", async () => {
      const updateTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .patch(`/api/todos/updateTodo/:${requiredId}`)
        .field({ taskName: "clean house" })
        .set({ Authorization: `Bearer ${token}` });
      expect(updateTodoResponse.status).to.equal(200);
      const getUpdatedTodoResponse = await chai.request(baseUrl.local.SERVER_URL)
        .get(`/api/todos/getTodos/:${requiredId}`);
      expect(getUpdatedTodoResponse.taskName).to.equal("clean house")
    });
  });
});