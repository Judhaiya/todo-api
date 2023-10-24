const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { requestError } = require("./errors");
const { baseUrl } = require("../utils/baseUrl");

dotenv.config();

/** 
* @param {string} token
* verify token takes access token as the argument and get the token verified
* if the token and appsecret is valid, return correct user email or whatever payload passed while generating token
*/

exports.verifyToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, baseUrl.local.JWT_SECRET);
  } catch (err) {
    console.error(err, "error in verifying token");
    throw requestError("jwt must be provided");
  }
};

/**
 * @param {string} email  
 * @returns {string} token.
 * generate token after taking in user email and app secret
 */
exports.generateToken = (email) => {
  return jwt.sign({ payload: email, expiry: "2h" }, baseUrl.local.JWT_SECRET);
};
