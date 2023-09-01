const { db } = require("./configuration");

const readDocFromCollection = async (collectionName, payload) => {
  const snapshot = await db
    .collection(collectionName)
    .where(Object.entries(payload)[0][0], "==", Object.entries(payload)[0][1])
    .get();

  if (snapshot.empty) {
    console.error("No matching documents.");
    return;
  }
  console.log({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }, "snapshot in db");
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

const getAllDocuments = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  const documentsWithId = snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
  return documentsWithId;
};
// get Single Document
const readSingleDocument = async (collectionName, payload) => {
  const snapshot = await readDocFromCollection(collectionName, payload).id;
  if (snapshot.empty) {
    console.error("No matching documents found.");
    return;
  }
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};
exports.addDocument = async (collectionName, payload) => {
  const addedDoc = await db.collection(collectionName).add(payload);
  return addedDoc;
};

exports.read = {
  singleByKey: readDocFromCollection,
  all: getAllDocuments,
  singleById: readSingleDocument,
};

// update document in a collection
const updateDocumentById = async (collectionName, payload) => {
  await db
    .collection(collectionName)
    .doc(Object.entries(payload)[0][1])
    .update(payload.update);
};
const readAndUpdateDoc = async (collectionName, payload) => {
  const docId = await readDocFromCollection(collectionName, payload).id;
  await db
    .collection(collectionName)
    .doc(Object.entries(docId))
    .update(payload.update);
};
exports.updateDocument = {
  updateDocumentById,
  updateDocumentByKey: readAndUpdateDoc,
};
// delete all documents
const deleteDocumentByKey = async (collectionName, payload) => {
  const doc = await readDocFromCollection(collectionName, payload);
   await db.collection(collectionName).doc(doc.id).delete();
};
const deleteDocumentById = async (collectionName, payload) => {
  await db
    .collection(collectionName)
    .doc(Object.entries(payload)[0][1])
    .delete();
};
exports.deleteDocument = {
  deleteDocumentById,
  deleteDocumentByKey
};

