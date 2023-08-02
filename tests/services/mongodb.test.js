const chai = require("chai");
const { connectDB } = require("../../utils/databaseConnection");
const { addCollection, readCollection, deleteCollection } = require("../../services/mongodb/actionFunctions");
const expect = chai.expect;

// read data from mongoose;
// write data in mongoose;
// delete data in mongoose;

const testUser = {
  userName: "livia",
  email: "livia16@gmail.com",
  password: "livia1234"
};


describe("if mongodb crud functions are tested ", () => {
  beforeEach(async () => {
    await connectDB();
  });
  it("insert data function should create record in the database", async () => {
    await addCollection("users", testUser);
    const userDetailsInDb = await readCollection("users", { email: testUser.email });
    expect({ email: userDetailsInDb.email, userName: userDetailsInDb.userName })
      .to.deep.equal({ email: testUser.email, userName: testUser.userName });
  });
  it("delete data function should delete user record in the database", async () => {
    await deleteCollection("users", { email: testUser.email });
    const userDetailsInDb = await readCollection("users", { email: testUser.email });
    expect(userDetailsInDb).to.be.null;
  });
});
