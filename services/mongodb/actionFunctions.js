const UsersData = require("./user");

const collectionGroup = {
  users: UsersData
};

exports.addCollection = async (name, payload) => {
  const collectionDetails = new collectionGroup[`${name}`](payload);
  await collectionDetails.save();
};

exports.readCollection = async (name, payload) => {
  return await collectionGroup[`${name}`].findOne(payload);
};

exports.deleteCollection = async (name, payload) => {
  await collectionGroup[`${name}`].deleteOne(payload);
};
