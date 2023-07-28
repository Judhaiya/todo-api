const chai = require("chai");
const { requestError, validationError } = require("../../services/errors");

const expect = chai.expect;

// testing request error function
describe("testing custom error function", () => {
  it("request error function works as expected if", () => {
    const errorObject = requestError("Invalid email");
    const expectedResults = {
      name: "request error",
      msg: "Invalid email",
      code: 400
    };
    for (const key in expectedResults) {
      expect(errorObject[key]).to.equal(expectedResults[key]);
    }
  });

  // testing validation error function
  it("validation error function works as expected if", () => {
    const errorObject = validationError("email format is wrong");
    const expectedResults = {
      name: "validation error",
      msg: "email format is wrong",
      code: 400
    };
    for (const key in expectedResults) {
      expect(errorObject[key]).to.equal(expectedResults[key]);
    }
  });
});