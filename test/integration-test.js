const mocha = require("mocha")
const chai = require("chai")
const dotenv = require("dotenv")
const request = require("request");

dotenv.config()
// test cases - signup
// 1. on hitting api with right params ,it should give 200 response
// 2. email is not undefined
// 3, userName is not undefined
// 4.password is not undefined
// 5. email is in regex format
// 6. password should be  equal to characters in length
// 7. hashed password and password is same
//8. check if username already exists in db

// login
// 1. email is not undefined
// 2. password is not undefined
// 3. password and hashed password is same
// 4. check if username already exists in db

describe("sign-api-test-cases", () => {
    describe("first-test-case", () => {
        it("whether the api is successfully fetching response", () => {
            request(`${process.env.SERVER_URI}`)
                .post('/auth/signup').end((err, res) => {
                    expect(`${req.body.password}`).to.have.length(6);
                })
        })
        it("email should not be null", () => {
            request(`${process.env.SERVER_URI}`)
                .post('/auth/signup').end((err, res) => {
                    expect(`${req.body.password}`).not.to.be.null;
                })
        })
    })
})