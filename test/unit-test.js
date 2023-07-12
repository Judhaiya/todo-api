var expect = require('chai').expect;

// sample test cases
var numbers = [1, 2, 3, 4, 5];
expect(numbers).to.be.an('array').that.includes(2);
expect(numbers).to.have.lengthOf(5);

// unit testing using regex -signup
const emailValidation = (givenValue) => {
    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    return emailRegex.test(givenValue)
}
describe("unit-test-sign-up", () => {
    it("negative - on entering wrong email format it should return false", () => {
        expect(emailValidation("123")).be.false
    })
    it("positive - on entering correct email format it should return true", () => {
        expect(emailValidation("123@gmail.com")).be.true
    })
})
