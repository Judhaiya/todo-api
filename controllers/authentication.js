const { userSignup, userLogin, deleteUserAccount } = require("../features/user");

exports.saveUserData = async (userDetails) => {
  const token = await userSignup(userDetails);
  return token;
};

exports.loginUser = async (userDetails) => {
  const token = await userLogin(userDetails);
  return token;
};

exports.deleteAccount = async (req) => {
  deleteUserAccount(req);
};
