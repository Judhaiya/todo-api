const chai = require("chai");
const {
  userSignup,
  userLogin,
  deleteUserAccount
} = require("../../features/user");
const { verifyToken } = require("../../services/token");
const { read } = require("../../services/firebase/firestore.queries");

const expect = chai.expect;

const testUser = {
  email: "streaks16@gmail.com",
  userName: "streaks",
  password: "streaks123"
};
const readAndDeleteData = async () => {
  const savedUserDetails = await read.singleByKey("users", {
    email: testUser.email
  });
  if (savedUserDetails) {
    const token = await userLogin({
      email: testUser.email,
      password: testUser.password
    });
    const req = {
      body: {
        email: testUser.email,
        password: testUser.password
      },
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    await deleteUserAccount(req);
  }
};
describe("signUpFeature", () => {
  let token;
  beforeEach(async () => {
    await readAndDeleteData();
    token = await userSignup(testUser);
  });
  it("return token if valid credentials are provided", async () => {
    const validEmail = verifyToken(token).payload;
    expect(validEmail).to.equal(testUser.email);
  });
  it("to check if userdetails are saved in database", async () => {
    const savedUserDetails = await read.singleByKey("users", {
      email: testUser.email
    });
    expect({
      email: savedUserDetails.email,
      userName: savedUserDetails.userName
    }).to.deep.equal({ email: testUser.email, userName: testUser.userName });
  });
  it("will throw error if created with existing email", async () => {
    try {
      await userSignup(testUser);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("User email already exists");
      expect(err.name).to.equal("request error");
    }
  });
  afterEach(async () => {
    await readAndDeleteData();
  });
});

describe("loginFeature", () => {
  beforeEach(async () => {
    await readAndDeleteData();
    await userSignup(testUser);
  });
  it("fails if we try to login with unregistered email", async () => {
    try {
      await userLogin({
        email: "iris12@gmail.com",
        password: testUser.password
      });
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("Invalid User email");
      expect(err.name).to.equal("request error");
    }
  });
  it("will succeed if we login with registered email", async () => {
    const token = await userLogin({
      email: testUser.email,
      password: testUser.password
    });
    const validEmail = verifyToken(token).payload;
    expect(validEmail).to.equal(testUser.email);
  });
  it("will fail if we enter wrong password", async () => {
    try {
      await userLogin({ email: testUser.email, password: "234567" });
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("Password doesn't match");
      expect(err.name).to.equal("request error");
    }
  });
  afterEach(async () => {
    await readAndDeleteData();
  });
});

describe("deleteUserFeature", () => {
  let token;
  beforeEach(async () => {
    await readAndDeleteData();
    token = await userSignup(testUser);
  });
  it("will not delete user account if invalid email is provided", async () => {
    try {
      const req = {
        body: {
          email: "iris12@gmail.com",
          password: testUser.password
        },
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      await deleteUserAccount(req);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("Invalid User email");
      expect(err.name).to.equal("request error");
    }
  });
  it("will not delete user account if wrong password is provided", async () => {
    try {
      const req = {
        body: {
          email: testUser.email,
          password: "234567"
        },
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      await deleteUserAccount(req);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("Password doesn't match");
      expect(err.name).to.equal("request error");
    }
  });
  it("will not delete user account if invalid token is provided", async () => {
    try {
      const req = {
        body: {
          email: testUser.email,
          password: testUser.password
        },
        headers: {
          authorization: "1234"
        }
      };
      await deleteUserAccount(req);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.msg).to.equal("invalid token");
      expect(err.name).to.equal("request error");
    }
  });
  it("will delete user account if valid credentials and token is provided", async () => {
    const req = {
      body: {
        email: testUser.email,
        password: testUser.password
      },
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    await deleteUserAccount(req);
    const userDetails = await read.singleByKey("users", {
      email: testUser.email
    });
    expect(userDetails).to.be.undefined;
  });
  afterEach(async () => {
    await readAndDeleteData();
  });
});
