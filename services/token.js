const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.verifyToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.JWT_SECRET);
};

exports.generateToken = (email) => {
  return jwt.sign({ payload: email }, process.env.JWT_SECRET);
};
