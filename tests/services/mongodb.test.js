const chai = require("chai");
const { connectDB } = require("../../utils/databaseConnection");
const { addCollection, readCollection, deleteCollection, updateCollection, getAllCollection, deleteAllDocument } = require("../../services/mongodb/actionFunctions");
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

describe("addDataInTheDocument ", () => {
  before(async () => {
    await connectDB();
  });
  it("insert data function should create record in the database", async () => {
    await addCollection("users", testUser);
    const userDetailsInDb = await readCollection("users", { email: testUser.email });
    expect({ email: userDetailsInDb.email, userName: userDetailsInDb.userName })
      .to.deep.equal({ email: testUser.email, userName: testUser.userName });

  });
  after(async () => {
    await deleteAllDocument("todos");
  })
})
describe("deleteSingleDocument", () => {
  before(async () => {
    await connectDB();
  });
  it("delete data function should delete user record in the database", async () => {
    await deleteCollection("users", { email: testUser.email });
    const userDetailsInDb = await readCollection("users", { email: testUser.email });
    expect(userDetailsInDb).to.be.null;
  });
});
describe("readDataInTheCollection", () => {
  before(async () => {
    await connectDB();
    await addCollection(("users", { email: testUser.email }));
  });
  it("passes the testcase while reading the collection ,the result shouldn't be null",
    async () => {
      expect(await readCollection("users", { email: testUser.email })).not.to.eql(null);
    });
  after(async () => {
    await deleteAllDocument("todos");
  })
})
describe("updateTodo", async () => {
  before(async () => {
    await connectDB();
  });
  it("works if it update data in the document", async () => {
    const payload = {
      filter: {
        taskName: sampleTodoData[0].taskName
      },
      update: {
        taskName: sampleTodoData[1].taskName
      }
    };
    await addCollection("todos", { taskName: sampleTodoData[0].taskName });
    await updateCollection("todos", payload);
    expect(await readCollection("todos", { taskName: sampleTodoData[1].taskName })).not.to.eql(null);
    after(async () => {
      await deleteAllDocument("todos");
    })
  });
})
describe("getAllTheTodos", () => {
  before(async () => {
    await connectDB();
  });
  it("getAllCollection", async () => {
    for (const todo of sampleTodoData) {
      await addCollection("todos", { taskName: todo.taskName });
    }
    const todoCollection = await getAllCollection("todos").map(({ taskName }) => {
      return { taskName };
    });
    expect(todoCollection).to.have.deep.members(sampleTodoData);
  })
  after(async () => {
    await deleteAllDocument("todos");
  })
});

describe("deleteAllDocument", () => {
  before(async () => {
    await connectDB();
    for (const todo of sampleTodoData) {
      await addCollection("todos", { taskName: todo.taskName });
    }
    it("test case passess  if it delete all the todos in the collection", async () => {
      await deleteAllDocument("todos");
      expect(await getAllCollection("todos").to.eql(null));
    });
  });
});
