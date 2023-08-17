const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { requestError } = require("./errors");
const { baseUrl } = require("../utils/baseUrl");

dotenv.config();

exports.verifyToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, baseUrl.local.JWT_SECRET);
  } catch (err) {
    console.error(err, "error in verifying token");
    throw requestError("jwt must be provided");
  }
};

exports.generateToken = (email) => {
  return jwt.sign({ payload: email, expiry: "2h" }, baseUrl.local.JWT_SECRET);
};
