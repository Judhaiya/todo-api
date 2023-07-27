const chai = require("chai");
const { connectDB } = require("../../utils/databaseConnection");
const { addUser, getUser, deleteUser } = require("../../services/mongodb/userFunctions");
const expect = chai.expect;

// read data from mongoose;
// write data in mongoose;
// delete data in mongoose;

const testUser = {
  userName: "livia",
  email: "livia12@gmail.com",
  password: "livia1234"
};


describe("if mongodb crud functions are tested ", () => {
  beforeEach(async () => {
    await connectDB();
  });
  it("insert data function should create record in the database", async () => {
    await addUser(testUser);
    const userDetailsInDb = await getUser(testUser.email);
    expect({ email: userDetailsInDb.email, userName: userDetailsInDb.userName })
      .to.deep.equal({ email: testUser.email, userName: testUser.userName });
  });
  it("delete data function should delete user record in the database", async () => {
    await deleteUser(testUser.email);
    const userDetailsInDb = await getUser();
    expect(userDetailsInDb).to.be.null;
  });
});
