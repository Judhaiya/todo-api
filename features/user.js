const UsersData = require("../services/mongodb.user");
const { generateToken, verifyToken } = require("../services/token");
const bcrypt = require("bcrypt");

const existingUser = async (userEmail) => {
  const existUserDetl = await UsersData.findOne({ email: userEmail });
  return existUserDetl;
};

const comparePassword = async (password, email) => {
  const userDetails = await existingUser(email);
  return bcrypt.compare(password.toString(), userDetails.password);
};

const userSignup = async (userDetail) => {
  const { email, userName, password } = userDetail;
  let isEmailFound = false;
  let accessToken;
  if (!existingUser) {
    isEmailFound = true;
    accessToken = null;
    return [isEmailFound, accessToken];
  }
  await new UsersData({
    email,
    userName,
    password
  }).save();
  accessToken = generateToken(email);
  return [isEmailFound, accessToken];
};

const userLogin = async (userDetails) => {
  let success, msg, accessToken;
  const { email, password } = userDetails;
  const existingUserDetails = await existingUser(email);
  if (!existingUserDetails) {
    success = false;
    msg = "Invalid User email";
    return [success, msg, accessToken];
  }
  if (!comparePassword(password, email)) {
    success = false;
    msg = "Password doesn't match";
    return [success, msg, accessToken];
  }
  accessToken = generateToken(email);
  msg = "User logged in successfully";
  return [success, msg, accessToken];
};

const deleteUserAccount = async (req) => {
  let success, msg;
  const { email, password } = req.body;
  const bearerToken = req?.headers?.authorization;
  const requiredToken = bearerToken?.split(" ")[1];
  const exstUserDetails = await existingUser(email);
  if (!exstUserDetails) {
    success = false;
    msg = "Invalid User email";
    return [success, msg];
  }
  if (!comparePassword(password, email)) {
    success = false;
    msg = "Password is invalid";
    return [success, msg];
  }
  const isJwtVerified = verifyToken(requiredToken);
  if (!isJwtVerified) {
    success = false;
    msg = "Token is invalid";
    return [success, msg];
  }
  await UsersData.deleteOne({ email });
  success = true;
  msg = "Account has been successfully deleted";
  return [success, msg];
};

module.exports = { existingUser, comparePassword, userSignup, userLogin, deleteUserAccount };
