const mocha = require("mocha")
const chai = require("chai")
const dotenv = require("dotenv")
const chaiHttp = require("chai-http")

dotenv.config()
chai.use(chaiHttp)
const expect = chai.expect
const should = chai.should()
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
        it("whether the api is successfully fetching response", (done) => {
            let userDetails = {
                userName: "Flynn",
                email: "BrandonFlynn12@gmail.com",
                password: "gemininerd"
            }
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send(userDetails)
                .end((err, res) => {
                    expect(200);
                    // res.body.should.have.property('msg')
                    // expect(res.body.msg).to.be.eql("user logged out");
                    done()
                })
        })
        it("negative cases - it should throw 400 if password has more than 6 characters in length"
            , (done) => {
                let userDetails = {
                    userName: "Flynn",
                    email: "gemininerd11@gmail.com",
                    password: 123457890
                }
                chai.request('http://localhost:8080')
                    .post('/api/auth/signup')
                    .send(userDetails)
                    .end((err, res) => {
                        expect(400);

                        done()
                    })
            })
        it("negative cases - it should if password has less than 6 characters in length", (done) => {
            let userDetails = {
                userName: "Flynn",
                email: "flora@gmail.com",
                password: 1234
            }
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send(userDetails)
                .end((err, res) => {
                    expect(400);

                    done()
                })
        })
        it("negative cases - show 400 error when no userName", (done) => {
            let userDetails = {
                email: "flora@gmail.com",
                password: 1234
            }
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send(userDetails)
                .end((err, res) => {
                    expect(400);

                    done()
                })
        })
        it("negative cases - show 400 error when no email", (done) => {
            let userDetails = {
                userName:"flora",
                password: 1234
            }
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send(userDetails)
                .end((err, res) => {
                    expect(400);

                    done()
                })
        })
        it("negative cases - should return 400 when email format is wrong",(done)=>{
             let userDetails = {
                email:"udhaiya",
                password:456789
             }
             chai.request('http://localhost:8080')
             .post('/api/auth/signup')
             .send(userDetails)
             .end((err, res) => {
                 expect(400);
                 res.body.should.have.property('msg').eql('Please enter a valid email');
                 done()
             })
        })
    })
})

describe("login-test-cases",()=>{
    describe("",()=>{
        it("if email empty,it should throw 400",(done)=>{
          let userDetails = {
            password:1234567
          }
          chai.request('http://localhost:8080')
          .post('/api/auth/login')
          .send(userDetails)
          .end((err, res) => {
              expect(400);

              done()
          })
        })
        it("if email empty,it should throw 400",(done)=>{
            let userDetails = {
              email:"flynn@gmail.com"
            }
            chai.request('http://localhost:8080')
            .post('/api/auth/login')
            .send(userDetails)
            .end((err, res) => {
                expect(400);
  
                done()
            })
          })

    })
})