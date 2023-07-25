const UsersData = require("../services/mongodb.user");
const { generateToken, verifyToken } = require("../services/token");
const { customError } = require("../services/errors");
const bcrypt = require("bcrypt");

exports.existingUser = async function (userEmail) {
  const existUserDetl = await UsersData.findOne({ email: userEmail });
  return existUserDetl;
};

exports.comparePassword = async function (password, email) {
  const userDetails = await exports.existingUser(email);
  return bcrypt.compare(password.toString(), userDetails.password);
};

exports.userSignup = async (userDetail) => {
  const { email, userName, password } = userDetail;
  if (await exports.existingUser(email)) {
    throw customError("User email already exists", 400);
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
  if (!await exports.existingUser(email)) {
    throw customError("Invalid User email", 400);
  }
  if (!await exports.comparePassword(password, email)) {
    throw customError("Password doesn't match", 400);
  }
  const accessToken = generateToken(email);
  return accessToken;
};

exports.deleteUserAccount = async function (req) {
  const { email, password } = req.body;
  const requiredToken = req?.headers?.authorization.split(" ")[1];
  if (!await exports.existingUser(email)) {
    throw customError("Invalid User email", 400);
  }
  if (!exports.comparePassword(password, email)) {
    throw customError("Password doesn't match", 400);
  }
  const isJwtVerified = verifyToken(requiredToken);
  if (!isJwtVerified) {
    throw customError("Token is invalid", 400);
  }
  await UsersData.deleteOne({ email });
};
