const { userSignup, userLogin, deleteUserAccount } = require("../features/user");

/**
 * @param {Object} userDetails 
 * @returns {string} token
 * saveUserdata returns token after promise being resolved from userSignup fn
 * if promise resolved with error,it will throw error
 */

exports.saveUserData = async (userDetails) => {
  const token = await userSignup(userDetails);
  return token;
};

/**
 * @param {Object} userDetails 
 * @returns {string} token
 * loginUser function returns token after promise resolved by userLogin function
 * if promise resolved with error,it will throw error
 */

exports.loginUser = async (userDetails) => {
  const token = await userLogin(userDetails);
  return token;
};

/**
 * @param {Object} req
 * deleteAccount function calls asynchronous deleteUserAccount function
 */

exports.deleteAccount = async (req) => {
  await deleteUserAccount(req);
};
