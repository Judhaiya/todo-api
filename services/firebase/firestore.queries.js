const { db } = require("./configuration");

exports.addDocument = async (collectionName, payload) => {
  const addedDoc = await db.collection(collectionName).add(payload);
  return addedDoc.id
}
const getAllDocuments = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  const documentsWithId = snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
  return documentsWithId;
};
// get Single Document
const readSingleDocument = async (collectionName, payload) => {
  const getCollectionData = await db.collection(collectionName).doc(payload.id).get();
  return getCollectionData.data();
};
exports.read = {
  single: readSingleDocument,
  all: getAllDocuments
}
// update document in a collection
exports.updateDocument = async (collectionName, payload) => {
  await db.collection(collectionName).doc(payload.filter.id).update(payload.update);
};
// delete all documents
exports.deleteDocument = async (collectionName, payload) => {
  await db.collection(collectionName).doc(payload.id).delete();
};
