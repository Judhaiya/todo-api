const { userSignup, userLogin, deleteUserAccount } = require("../features/user");

exports.saveUserData = async (userDetail) => {
  userSignup(userDetail);
};

exports.loginUser = async (userDetails) => {
  userLogin(userDetails);
};

exports.deleteAccount = async (req) => {
  deleteUserAccount(req);
};
