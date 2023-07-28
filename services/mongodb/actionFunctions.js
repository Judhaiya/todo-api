exports.addCollection = async (Collection, payload) => {
  const collectionDetails = new Collection(payload);
  await collectionDetails.save();
};

exports.readCollection = async (Collection, payload) => {
  return await Collection.findOne(payload);
};

exports.deleteCollection = async (Collection, payload) => {
  await Collection.deleteOne(payload);
};
