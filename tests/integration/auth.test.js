const chai = require("chai");
const dotenv = require("dotenv");
const chaiHttp = require("chai-http");
const { getUser } = require("../../services/mongodb/userFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../../utils/databaseConnection");

dotenv.config();
chai.use(chaiHttp);
const expect = chai.expect;

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
};
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
];

async function apiNegative(expectedUrl, expectedDetails, action) {
  for (const userDetail of expectedDetails) {
    const filterUserDetails = expectedDetails.filter(detail => detail.key !== userDetail.key);
    const correctDetails = filterUserDetails.reduce((prev, cur) => {
      return Object.assign(prev, { [cur.key]: cur.correctValue });
    }, {});
    for (const wrongValue of userDetail.wrongValues) {
      const res = await chai.request(process.env.SERVER_URL)
        .post(expectedUrl)
        .send({ correctDetails, [userDetail.key]: wrongValue });

      expect(res.statusCode).to.equal(400);
    }
    const res = await chai.request(process.env.SERVER_URL)
      .post(expectedUrl)
      .send(correctDetails);
    expect(res.statusCode).to.equal(400);
  }
}

describe("sign api prep", () => {
  describe("when signup is called", () => {
    let regUserDetails;
    beforeEach(async () => {
      await connectDB();
      regUserDetails = await getUser(userDetails.email);
      if (regUserDetails) {
        const res = await chai.request(`${process.env.SERVER_URL}`)
          .delete("/api/auth/deleteUser")
          .set({ Authorization: `Bearer ${process.env.STATIC_TOKEN}` })
          .send(userDetails);
        expect(res?.status).to.equal(200);
      }
    });
    it("does the api process registration correctly", async () => {
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/signup")
        .send(userDetails);
      expect(res.status).to.equal(200);
      expect(res.body.msg).to.be.eql("User account has been created successfully");
      const jwtDetails = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(userDetails.email).eql(jwtDetails.payload);
      const regUserDetails = await getUser(userDetails.email);
      const isPasswordMatched = await bcrypt.compare(userDetails?.password.toString(),
        regUserDetails?.password);
      expect(isPasswordMatched).to.be.true;
    });
    it("should return 400 if invalid data is fed"
      , async () => {
        await apiNegative("/api/auth/signup", payloadDetails, "post");
      }
    );
  });
});

describe("login-test-cases", () => {
  describe("when login is called", () => {
    beforeEach(async () => {
      await connectDB();
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/signup")
        .send(userDetails);
      expect(res.statusCode).to.be.oneOf([200, 400]);
      console.log(res.body.msg, "res.body");
      expect(res.body.msg).to.be.oneOf(["User email already exists",
        "User account has been created successfully"]);
    });
    it(`it should see whether the username already exists and
         respond with 200 if it is present`, async () => {
      const findEmail = await getUser(userDetails.email);
      console.log(findEmail?.email, findEmail, "findEmail");
      expect(findEmail?.email).eql(userDetails?.email);
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/login")
        .send(userDetails);
      console.log(res.body, "res.body in login");
      expect(res.body.msg).to.be.eql("User logged in successfully");
      expect(res.statusCode).to.equal(200);
    });

    it("should return 400 if invalid data is fed", async () => {
      await apiNegative("/api/auth/login", payloadDetails, "post");
    });
  });
});

// test cases - delete
// when we pass username,password,token  it should respond with status 200
// no jwt token is pass,it should respond with status 400
// no password,it should respond with status 400
// no username it should respond with status 400

describe("when delete operation is executed", () => {
  describe("it should", () => {
    let token;
    beforeEach(async () => {
      await connectDB();
      const res = await chai.request(process.env.SERVER_URL)
        .post("/api/auth/signup")
        .send(userDetails);
      if (res.statusCode === 200) {
        expect(res.statusCode).to.equal(200);
        expect(res.body.msg).to.equal("User account has been created successfully");
        token = res.body.token;
        return token;
      } else if (res.statusCode === 400) {
        expect(res.statusCode).to.equal(400);
        expect(res.body.msg).to.equal("User email already exists");
        console.log("user email already exists in login before delete", res.body.msg);
        const tokenRes = await chai.request(process.env.SERVER_URL)
          .post("/api/auth/login")
          .send(userDetails);
        token = tokenRes.body.token;
        return token;
      }
    });
    it("respond with status code 200 when email, password,token is passed",
      async () => {
        const res = await chai.request(process.env.SERVER_URL)
          .delete("/api/auth/deleteUser")
          .set({ Authorization: `Bearer ${token}` })
          .send({
            email: userDetails.email,
            password: userDetails.password
          });
        expect(res.statusCode).to.equal(200);
        expect(res.body.msg).to.equal("Account has been successfully deleted");
        // token
      });
    it("should return 400 if invalid data is fed", async () => {
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
      ];
      await apiNegative("/api/auth/deleteUser", deleteDetails, "delete");
    });
  });
});

