const UsersData = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const emailValidation = (givenValue) => {
  const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
  return emailRegex.test(givenValue);
};
exports.emailValidation = emailValidation;

const existingUser = async (userEmail) => {
  const existUserDetl = await UsersData.findOne({ email: userEmail });
  return existUserDetl;
};
const comparePassword = async (password, email) => {
  const userDetails = await existingUser(email);
  return bcrypt.compare(password.toString(), userDetails.password);
};
const generateToken = (email) => {
  return jwt.sign({ payload: email }, process.env.JWT_SECRET);
};
const verifyToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.JWT_SECRET);
};

module.exports = { existingUser, comparePassword, generateToken, verifyToken };
