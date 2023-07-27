const { verifyToken, generateToken } = require("../../services/token");
const chai = require("chai");
const expect = chai.expect;

const userEmail = "levia14@gmail.com";
describe("verification and token generation function works perfectly", () => {
  it("if on token verfication it generates the expected email", () => {
    const tokenVerifiedEmail = verifyToken(generateToken(userEmail)).payload;
    expect(tokenVerifiedEmail).to.equal(userEmail);
  });
});
