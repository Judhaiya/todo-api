const chai = require("chai");
const { addDocument, read, updateDocument, deleteDocument} = require("../../services/firebase/firestore.queries");
const expect = chai.expect;

// read data from mongoose;
// write data in mongoose;
// delete data in mongoose;
// update data in mongoose;
// get all data in mongoose;
// delete all data in mongoose

const testUser = {
  userName: "livia",
  email: "livia16@gmail.com",
  password: "livia1234"
};
const sampleTodoData = [
  { taskName: "to tidy home" },
  {
    taskName: "to embelish home for today's party"
  }
];

describe("addDataInTheDocument", () => {
it("insert data function should create record in the database", async () => {
   todoId = await addDocument("users", testUser);
    const userDetailsInDb = await read.singleByKey("users", { email: testUser.email });
    expect({ email: userDetailsInDb.email, userName: userDetailsInDb.userName })
      .to.deep.equal({ email: testUser.email, userName: testUser.userName });
    });
  after(async () => {
    await deleteDocument.deleteDocumentByKey("users", { email: testUser.email });
  });
});
describe("deleteSingleDocument", () => {
it("delete data function should delete user record in the database", async () => {
    await addDocument("users", testUser);
    await deleteDocument.deleteDocumentByKey("users", { email: testUser.email });
    const userDetailsInDb = await read.singleByKey("users", { email: testUser.email });
   expect(userDetailsInDb).to.be.undefined;
  });
  // after(async () => {
  //   await deleteDocument.deleteDocumentByKey("users", { email: testUser.email });
  // })
});
describe("getSingleTodo", () => {
  before(async () => {
  await addDocument("users", testUser);
  });
  it("passes the testcase while reading the collection ,the result shouldn't be null",
    async () => {
      expect(await read.singleByKey("users", { email: testUser.email })).not.to.eql(null);
    });
  after(async () => {
    await deleteDocument.deleteDocumentByKey("users", { email: testUser.email });
  });
});
describe("updateTodo", async () => {
  describe("update todo works", () => {
    let id;
    before(async () => {
     id = await addDocument("todos", { taskName: sampleTodoData[0].taskName });
    });
    it("works if it update data in the document", async () => {
      const payload = {
        filter: {
          id
        },
        update: {
          taskName: "to mop the floor"
        }
      };
     await updateDocument.updateDocumentById("todos", payload);
     const updatedTodo = await read.singleById("todos", { id });
    expect(updatedTodo.taskName).to.eql("to mop the floor");
    });
    after(async () => {
      await deleteDocument.deleteDocumentById("todos", { id });
    });
  });
});
describe("getAllTheTodos", () => {
  before(async () => {
  for (const todo of sampleTodoData) {
      await addDocument("todos", { taskName: todo.taskName });
    }
  });
  it("getAllCollection", async () => {
    const todoCollection = [...await read.all("todos")].map(({ taskName }) => {
      return { taskName };
    });
    expect(todoCollection).to.have.deep.members(sampleTodoData);
  });
  after(async () => {
    for (const todo of sampleTodoData) {
      await deleteDocument.deleteDocumentByKey("todos", { taskName: todo.taskName });
    }
  });
});
