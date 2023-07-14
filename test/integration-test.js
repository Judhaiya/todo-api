const chai = require("chai")
const dotenv = require("dotenv")
const chaiHttp = require("chai-http")
const UsersData = require("../models/UserModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { connectDB } = require("../utils/databaseConnection")

dotenv.config()
connectDB()
chai.use(chaiHttp)
const expect = chai.expect

// test cases - signup
// 1. on hitting api with right params ,it should give 200 response
// 2. email is not undefined
// 3, userName is not undefined
// 4.password is not undefined
// 5. email is in regex format
// 6. password should be  equal to characters in length
// 7. hashed password and password is same
// 8. check if username already exists in db
// 9.comparing password
// 10.jwt verification

// login
// 1. email is not undefined
// 2. password is not undefined
// 3. password and hashed password is same
// 4. check if username already exists in db

// login form validation
const userDetails = {
  email: "BrandonFlynn12@gmail.com",
  userName: "Flynn",
  password: "gemininerd"
}
const payloadDetails = [
  {
    key: "email",
    wrongValues: ["udhaiya"],
    correctValue: "BrandonFlynn12@gmail.com"
  },
  {
    key: "userName",
    wrongValues: [1234567],
    correctValue: "Flynn"
  },
  {
    key: "password",
    wrongValue: [1234, 1234578901112],
    correctValue: "gemininerd"
  }
]

function apiNegative(expectedUrl, expectedDetails, token) {
  expectedDetails.map(userDetail => {
    // if wrong values are entered
    const filterUserDetails = expectedDetails.filter(detail => detail.key !== userDetail.key)
    const correctDetails = filterUserDetails.reduce((prev, cur) => {
      return Object.assign(prev, { [cur.key]: cur.correctValue })
    }, {})
    // reduce the object
    userDetail?.wrongValues.map(wrongValue => {
      return chai.request(process.env.SERVER_URI)
        .post(expectedUrl)
        .send({ correctDetails, [userDetail.key]: wrongValue })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.body.msg).to.be.eql(`${userDetail.key} is invalid`)
        })
    })
    return chai.request(process.env.SERVER_URI)
      .post(expectedUrl)
      .send(correctDetails)
      .end((err, res) => {
        expect(res.statusCode).to.equal(400)
        expect(res.body.msg).to.be.eql(`${userDetail.key} is empty`)
      })
  })
}

describe("sign api prep", () => {
  let token
  const findEmail = UsersData.findOne({ email: userDetails.email })
  before(() => {
    if (findEmail) {
      chai.request(`${process.env.SERVER_URL}`)
        .delete("api/auth/delete")
        .send(userDetails)
        .end((err, res) => {
          expect(err).to.be(undefined)
          expect(res.statusCode).to.equal(200)
          token = res.body.token
          return token
        })
    }
  })
  describe("when signup is called", () => {
    it("does the api process registration correctly", async (done) => {
      chai.request(process.env.SERVER_URI)
        .post("/api/auth/signup")
        .send(userDetails)
        .end(async (err, res) => {
          expect(err).to.be(undefined)
          expect(res.statusCode).to.equal(200)
          res.body.should.have.property("msg")
          expect(res.body.msg).to.be.eql("User account has been created successfully")
          if (findEmail) {
            expect(userDetails).to.deep.equal(findEmail)
          }
          jwt.verify(token, process.env.JWT_SECRET).then(jwtDetails => {
            return expect(userDetails).to.deep.equal(jwtDetails)
          })
          const isPasswordMatched = await bcrypt.compare(userDetails?.password, findEmail?.password)
          expect(isPasswordMatched).to.not.be(false)
          done()
        })
    })
    it("should return 400 if invalid data is fed"
      , async (done) => {
        apiNegative("/api/auth/signup", payloadDetails)
        done()
      }
    )
  })
})

describe("login-test-cases", () => {
  describe("when login is called", () => {
    before(() => {
      request(process.env.SERVER_URL)
        .post("api/auth/signup")
        .send(userDetails)
        .end((err, res) => {
          token = res.body.token
          expect(res.statusCode).to.be.oneOf([200, 400])
          expect(res.body.should.have.property("msg").to.be.oneOf(["User account has been created successfully",
            "User email already exists"
          ]))
          expect(err).to.be(undefined)
        })
    })
    it(`it should see whether the username already exists and
         respond with 200 if it is present`, async (done) => {
      const findEmail = UsersData.findOne({ email: userDetails.email })
      expect(findEmail?.email).to.equal(userDetails?.email)
      chai.request(process.env.SERVER_URI)
        .post("/api/auth/login")
        .send(userDetails)
        .end((err, res) => {
          expect(err).to.be(undefined)
          expect(res.body.should.have.property("msg").eql("User has been successfully logged in"))
          expect(res.statusCode).to.equal(200)
        })
      done()
    })

    it("should return 400 if invalid data is fed", (done) => {
      apiNegative("/api/auth/login", payloadDetails)
      done()
    })
  })
})

// test cases - delete
// when we pass username,password,token  it should respond with status 200
// no jwt token is pass,it should respond with status 400
// no password,it should respond with status 400
// no username it should respond with status 400

describe("when delete operation is executed", () => {
  describe("it should", () => {
    let token
    before(() => {
      request(process.env.SERVER_URL)
        .post("api/auth/signup")
        .send(userDetails)
        .end((err, res) => {
          token = res.body.token
          expect(res.statusCode).to.be.oneOf([200, 400])
          expect(res.body.should.have.property("msg")
            .to.be.oneOf(["User account has been created successfully",
              "User email already exists"
            ]))
        })
    })
    it("respond with status code 200 when email password,token is passed",
      (done) => {
        chai.request(process.env.SERVER_URI)
          .delete("api/auth/delete")
          .send({
            email: userDetails.email,
            password: userDetails.password,
            token
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200)
            expect(err).to.be(undefined)
            expect(res.body.should.have.property("msg").eql(`Account has been
                        successfully deleted`))
          })
        // token
        done()
      })
    it("should return 400 if invalid data is fed", (done) => {
      const deleteDetails = [
        {
          key: "email",
          wrongValues: ["udhaiya"],
          correctValue: "BrandonFlynn12@gmail.com"
        },
        {
          key: "password",
          wrongValue: [1234, 1234578901112],
          correctValue: "gemininerd"
        },
        {
          key: "token",
          wrongValue: "1234556",
          correctValue: token
        }
      ]
      apiNegative(deleteDetails, "api/auth/delete")
      done()
    })
  })
})

