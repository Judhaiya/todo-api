const { db } = require("./configuration");

// read document from collection that matches the provide payload
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

//  add document to collection by specifing which colllection it needs to be added

exports.addDocument = async (collectionName, payload) => {
  const addedDoc = await db.collection(collectionName).add(payload);
  return addedDoc.id;
};

/** read  documents in a collection
 * singleByKey function takes collectionName,paylod ,gets document based on payload from the collection
 * all function takes collectionName and gets all the document from the collection
 * singleById gets document from the collection by id
 */
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

/**
 * updateDocument has two functions 
 * updateDocument by id
 * updateDocument by key
 * updateDocumentById : update document by id by taking in collectionName,payload as the argument
 * updateDocumentByKey: update document by payload by taking in collectionName,payload as the argument
 */

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

 * 
 * @param {*} collectionName 
 * @param {*} payload 
 */
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

/**
 * deleteDocument has two functions
 * deleteDocumentById
 *  deleteDocumentByKey
 * deleteDocumentById : deleteDocumentById delete document by id by taking in collectionName,payload as the argument
 * deleteDocumentByKey : deleteDocumentByKey delete document by payload by taking in collectionName,payload as the argument
 */
exports.deleteDocument = {
  deleteDocumentById,
  deleteDocumentByKey
};
