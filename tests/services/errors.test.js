const chai = require("chai");
const { requestError, validationError } = require("../../services/errors");

const expect = chai.expect;

// testing request error function
describe("testing custom error function", () => {
  it("request error function works as expected if", () => {
    expect(requestError("Invalid email").name).to.equal("request error");
    expect(requestError("Invalid email").msg).to.equal("Invalid email");
    expect(requestError("Invalid email").code).to.equal(400);
  });
  // testing validation error function
  it("validation error function works as expected if", () => {
    expect(validationError("email format is wrong").name).to.equal("request error");
    expect(validationError("Invalid email").msg).to.equal("Invalid email");
    expect(validationError("Invalid email").code).to.equal(400);
  });
});