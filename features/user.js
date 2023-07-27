const UsersData = require("../services/mongodb/user");
const { generateToken, verifyToken } = require("../services/token");
const { requestError } = require("../services/errors");
const bcrypt = require("bcrypt");
const { getUser, deleteUser } = require("../services/mongodb/userFunctions");

;

exports.comparePassword = async function (password, email) {
  const userDetails = await getUser(email);
  return bcrypt.compare(password.toString(), userDetails?.password);
};
const comparePassword = exports.comparePassword;
exports.userSignup = async (userDetail) => {
  const { email, userName, password } = userDetail;
  if (await getUser(email)) {
    throw requestError("User email already exists");
  }
  await new UsersData({
    email,
    userName,
    password
  }).save();
  const accessToken = generateToken(email);
  return accessToken;
};

exports.userLogin = async function (userDetails) {
  const { email, password } = userDetails;
  const existingUser = await getUser(email);
  if (!existingUser) {
    throw requestError("Invalid User email");
  }
  if (!await comparePassword(password, email)) {
    throw requestError("Password doesn't match");
  }
  const accessToken = generateToken(email);
  return accessToken;
};

exports.deleteUserAccount = async function (req) {
  const { email, password } = req.body;
  const requiredToken = req?.headers?.authorization?.split(" ")[1];
  console.log("delete api call feature function");
  const userDetails = await getUser(email);
  if (!userDetails) {
    throw requestError("Invalid User email");
  }
  if (!comparePassword(password, email)) {
    console.log(!comparePassword(password, email), "compare password");
    throw requestError("Password doesn't match");
  }
  const jwtVerifiedPayload = verifyToken(requiredToken);
  if (!jwtVerifiedPayload) {
    throw requestError("Token is invalid");
  }
  await deleteUser(email);
};
