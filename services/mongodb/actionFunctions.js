const UsersData = require("./user");

const collectionGroup = {
  users: UsersData
};

exports.addCollection = async (name, payload) => {
  const collectionDetails = new collectionGroup[`${name}`](payload);
  await collectionDetails.save();
};

exports.readCollection = async (Collection, payload) => {
  return await Collection.findOne(payload);
};

exports.deleteCollection = async (Collection, payload) => {
  await Collection.deleteOne(payload);
};
