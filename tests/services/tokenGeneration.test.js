const {verifyToken,generateToken} = require("../../services/token");
const chai = require("chai");

const expect = chai.expect;

const userEmail = "levia14@gmail.com";
describe("ttesting verification and token generation", () => {
  it("verify token", () => {
     generateToken(userEmail);
     console.log(generateToken(userEmail));
  })
})
