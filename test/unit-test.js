const expect = require("chai"
).expect
const { emailValidation } = require("../controllers/authCtrl")
// sample test cases

// unit testing using regex -signup
describe("unit-test-sign-up", () => {
  it("negative - on entering wrong email format it should return false", () => {
    expect(emailValidation("123")).be.false
  })
  it("positive - on entering correct email format it should return true", () => {
    expect(emailValidation("123@gmail.com")).be.true
  })
})
