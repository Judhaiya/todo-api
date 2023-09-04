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
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

// get Single Document

exports.addDocument = async (collectionName, payload) => {
  const addedDoc = await db.collection(collectionName).add(payload);
  return addedDoc.id;
};

exports.read = {
  singleByKey: async (collectionName, payload) => {
    const snapshot = await db
      .collection(collectionName)
      .where(Object.entries(payload)[0][0], "==", Object.entries(payload)[0][1])
      .get();

    if (snapshot.empty) {
      console.error("No matching documents.");
      return;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },
  all: async (collectionName) => {
    const snapshot = await db.collection(collectionName).get();
    if (snapshot.empty) {
      return;
    }
    const documentsWithId = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    return documentsWithId;
  },
  singleById: async (collectionName, payload) => {
    const snapshot = await db
      .collection(collectionName)
      .doc(Object.entries(payload)[0][1])
      .get();
    if (snapshot.empty) {
      console.error("No matching documents found.");
      return;
    }
    if (snapshot.data() === undefined) {
      return;
    }
    return { id: snapshot.id, ...snapshot.data() };
  }
};

// update document in a collection
exports.updateDocument = {
  updateDocumentById: async (collectionName, payload) => {
    await db
      .collection(collectionName)
      .doc(Object.entries(payload.filter)[0][1])
      .update(payload.update);
  },
  updateDocumentByKey: async (collectionName, payload) => {
    const doc = await readDocFromCollection(collectionName, payload);
    await db
      .collection(collectionName)
      .doc(Object.entries(doc.id))
      .update(payload.update);
  }
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
