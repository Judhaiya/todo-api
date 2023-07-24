const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const verifyToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.JWT_SECRET);
};

const generateToken = (email) => {
  return jwt.sign({ payload: email }, process.env.JWT_SECRET);
};

exports.module = { verifyToken, generateToken };
