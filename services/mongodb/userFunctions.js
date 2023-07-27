const UsersData = require("./user");

exports.addUser = async (userPayload) => {
  const userDetail = new UsersData(userPayload);
  await userDetail.save();
};

exports.getUser = async (email) => {
  const getIndividualUser = await UsersData.findOne({ email });
  return getIndividualUser;
};

exports.deleteUser = async (email) => {
  await UsersData.deleteOne({ email });
};
