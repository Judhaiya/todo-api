const UsersData = require("../models/user");
const dotenv = require("dotenv");
const { existingUser, comparePassword,
  generateToken, verifyToken } = require("../utils/serviceFunction")
dotenv.config();

exports.saveUserData = async (userDetail) => {
  const { email, userName, password } = userDetail;
  const emailExists = await UsersData.findOne({ email });
  let isEmailFound = false;
  let accessToken;
  if (emailExists) {
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

exports.loginUser = async (userDetails) => {
  let success, msg, accessToken;
  const { email, password } = userDetails;
  const exstUserDetails = await existingUser(email);
  if (!exstUserDetails) {
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

exports.deleteAccount = async (req) => {
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
