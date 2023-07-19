const chai = require("chai")
const dotenv = require("dotenv")
const chaiHttp = require("chai-http")
const UsersData = require("../models/UserModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { connectDB } = require("../utils/databaseConnection")

dotenv.config()
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
  password: "123456"
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
    wrongValues: [1234, 1234578901112],
    correctValue: "gemininerd"
  }
]

function apiNegative(expectedUrl, expectedDetails) {
  console.log(expectedDetails, "ed")
  expectedDetails.map(async (userDetail) => {
    // if wrong values are entered
    const filterUserDetails = expectedDetails.filter(detail => detail.key !== userDetail.key)
    const correctDetails = filterUserDetails.reduce((prev, cur) => {
      return Object.assign(prev, { [cur.key]: cur.correctValue })
    }, {})
    // reduce the object
    userDetail?.wrongValues.map(async (wrongValue) => {
      const res = await chai.request(process.env.SERVER_URI)
        .post(expectedUrl)
        .send({ correctDetails, [userDetail.key]: wrongValue })

      expect(res.statusCode).to.equal(400)
      expect(res.body.msg).to.be.eql(`${userDetail.key} is invalid`)
    })
    const res = await chai.request(process.env.SERVER_URI)
      .post(expectedUrl)
      .send(correctDetails)

    expect(res.statusCode).to.equal(400)
    expect(res.body.msg).to.be.eql(`${userDetail.key} is empty`)
  })
}


describe("sign api prep", () => {
  describe("when signup is called", () => {
    let findEmail
    beforeEach(async () => {
      await connectDB()
      findEmail = await UsersData.findOne({ email: userDetails.email })
      if (findEmail) {
        const res = await chai.request(`${process.env.SERVER_URL}`)
          .delete("/api/auth/deleteUser")
          .set({ "Authorization": `Bearer ${process.env.STATIC_TOKEN}` })
          .send(userDetails)
        expect(res?.status).to.equal(200)
      }
    })
    it("does the api process registration correctly", async () => {
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/signup")
        .send(userDetails)
      expect(res.status).to.equal(200)
      // expect(res).body.to.have.property("msg")
      expect(res.body.msg).to.be.eql("User account has been created successfully")
      // if (findEmail) {
      //   expect(userDetails).to.deep.equal(findEmail)
      // }
      const jwtDetails = jwt.verify(res.body.token, process.env.JWT_SECRET)
      console.log(jwtDetails, "jd,jwrt")
      expect(userDetails.email).eql(jwtDetails.payload)
      const isPasswordMatched = await bcrypt.compare(userDetails?.password.toString(), findEmail?.password)
      expect(isPasswordMatched).to.be.true
    })
    it("should return 400 if invalid data is fed"
      , async () => {
        apiNegative("/api/auth/signup", payloadDetails)
      }
    )
  })
})

describe("login-test-cases", () => {
  describe("when login is called", () => {
    beforeEach(async () => {
      await connectDB()
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/signup")
        .send(userDetails)
      expect(res.statusCode).to.be.oneOf([200, 400])
      // expect(res.body.should.have.property("msg").to.be.oneOf(["User account has been created successfully",
      //   "User email already exists"
      // ]))
    })
    it(`it should see whether the username already exists and
         respond with 200 if it is present`, async () => {
      const findEmail = await UsersData.findOne({ email: userDetails.email })
      console.log(findEmail.email, userDetails?.email, "findEmail")
      //   console.log(userDetails, "login-test-cases")
      expect(findEmail?.email).eql(userDetails?.email)
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/login")
        .send(userDetails)
      console.log("res-in login", res.body)
      expect(res.body.msg).to.be.eql("User logged in successfully")
      expect(res.statusCode).to.equal(200)
      // console.log(userDetails?.email, res.statusCode, "status", "testing-email")
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
    beforeEach(async () => {
      await connectDB()
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/signup")
        .send(userDetails)
      // expect(res.statusCode).to.be.oneOf([200, 400])
      // expect(res.body.msg
      //   .to.be.oneOf(["User account has been created successfully",
      //     "User email already exists"
      //   ]))
      if (res.statusCode === 200) {
        expect(res.statusCode).to.equal(200)
        expect(res.body.msg).to.equal("User account has been created successfully")
        token = res.body.token
        return token
      } else if (res.statusCode === 400) {
        expect(res.statusCode).to.equal(400)
        expect(res.body.msg).to.equal("User email already exists")
        const tokenRes = await chai.request(process.env.SERVER_URL)
          .post("/api/auth/login")
          .send(userDetails)
        token = tokenRes.body.token
        return token
      }

      console.log("before each")
    })
    it("respond with status code 200 when email, password,token is passed",
      async () => {
        console.log(token, "token")
        chai.request(process.env.SERVER_URL)
          .delete("/api/auth/deleteUser")
          .send({
            email: userDetails.email,
            password: userDetails.password,
            token
          })
          .then(res => expect(res.statusCode).to.equal(200))

        // expect(res.body.should.have.property("msg").eql(`Account has been
        //                 successfully deleted`))
        // token
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
          wrongValues: [1234, 1234578901112],
          correctValue: "gemininerd"
        },
        {
          key: "token",
          wrongValues: "1234556",
          correctValue: token
        }
      ]
      apiNegative("/api/auth/deleteUser", deleteDetails)
      done()
    })
  })
})
