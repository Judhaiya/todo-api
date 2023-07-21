const UsersData = require("../models/user");
const bcrypt = require("bcrypt");
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
  console.log(password.toString(),
    await existingUser(email), "in service fn");
  return bcrypt.compare(password.toString(), existingUser(email)?.password);
};

module.exports = { existingUser, comparePassword };
