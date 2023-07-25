const UsersData = require("../services/mongodb/user");
const { generateToken, verifyToken } = require("../services/token");
const { requestError } = require("../services/errors");
const bcrypt = require("bcrypt");

const existingUser = exports.existingUser = async function (userEmail) {
  const existUserDetl = await UsersData.findOne({ email: userEmail });
  return existUserDetl;
};

const comparePassword = exports.comparePassword = async function (password, email) {
  const userDetails = await exports.existingUser(email);
  return bcrypt.compare(password.toString(), userDetails.password);
};

exports.userSignup = async (userDetail) => {
  const { email, userName, password } = userDetail;
  if (existingUser(email)) {
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
  if (!existingUser(email)) {
    throw requestError("Invalid User email");
  }
  if (!comparePassword(password, email)) {
    throw requestError("Password doesn't match");
  }
  const accessToken = generateToken(email);
  return accessToken;
};

exports.deleteUserAccount = async function (req) {
  const { email, password } = req.body;
  const requiredToken = req?.headers?.authorization.split(" ")[1];
  if (!existingUser(email)) {
    throw requestError("Invalid User email");
  }
  if (!comparePassword(password, email)) {
    throw requestError("Password doesn't match");
  }
  const isJwtVerified = verifyToken(requiredToken);
  if (!isJwtVerified) {
    throw requestError("Token is invalid");
  }
  await UsersData.deleteOne({ email });
};
