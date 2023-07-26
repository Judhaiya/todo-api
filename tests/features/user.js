const chai = require('chai');
const { connectDB } = require("../../utils/databaseConnection");
const { addUser, getUser, deleteUser, deleteUser } = require("../../services/mongodb/userFunctions");
const bcrypt = require("bcrypt");

const expect = chai.expect;

const testUser = {
    email: "streaks16@gmail.com",
    userName: "streaks",
    password: "streaks123"
}

describe("sign up works perfectly", () => {
    beforeEach(async () => {
        await connectDB();
    })
    it("", async () => {
        addUser(testUser);
        const getSavedUser = await getUser(testUser.email);
        expect({ email: testUser.email, userName: testUser.userName }).to.deep
            .equal({ email: getSavedUser.email, userName: getSavedUser.userName });

    })

})
describe("login api", () => {
    beforeEach(async () => {
        await connectDB();
    })
    it("user email exists negative", async () => {

        const getTestUserOne = await getUser("striti12@gmail.com");
        expect(getTestUserOne).to.be.null;
    })
    it("user email exists positive", async () => {
        const getTestUserTwo = await getUser(testUser.email);
        expect({ email: getTestUserTwo.email, userName: getTestUserTwo.userName }).to.deep
            .equal({ email: testUser.email, userName: testUser.userName });
    })

    it("password comparsion scenario", async () => {
        const getUserDetails = await getUser(testUser.email);
        const passwordMatchOne = bcrypt.compare(testUser.password.toString(), getUserDetails.password);
        expect(passwordMatchOne).to.be.true
    });
    it("password comparsion scenario -negative", async () => {
        const getUserDetails = await getUser(testUser.email);
        const passwordMatchTwo = bcrypt.compare("flower", getUserDetails.password);
        expect(passwordMatchTwo).to.be.false
    });
})

describe("delete api", () => {
    beforeEach(async () => {
        await connectDB();
    })
    it("delete if valid payload is provided", async () => {
        const deleteUser = await deleteUser(testUser)
        const getUserDetails = await getUser(testUser.email);
        expect(getUserDetails).to.be.null;
    })
})