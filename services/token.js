const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { requestError } = require("./errors");
dotenv.config();

exports.verifyToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (err) {
    console.error(err, "error in verifying token");
    throw requestError("invalid token");
  }
};

exports.generateToken = (email) => {
  return jwt.sign({ payload: email, expiry: "2h" }, process.env.JWT_SECRET);
};
