const { db } = require("./configuration");
// testing
// (async () => {
//   const res = await db.collection("cities").add({
//     name: "Tokyo",
//     country: "Japan"
//   });
//   console.log("Added document with ID: testing ", res.id);
// })();

// get all documentss
exports.getAllDocuments = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
};
// get Single Document
exports.readDocument = async (collectionName, payload) => {
  console.log(db.FieldPath, "fieldpath");
  // const snapshot = await db.collection(collectionName).where("country", "==", "Japan");
  // snapshot.get().then(snapshot => {
  //   snapshot.forEach(user => {
  //     console.log(user.id, ' => ', user.data());
  //   });
  // })
  const citiesRef = db.collection('cities');
  const snapshot = await citiesRef.where('capital', '==', "Japan").get();
  console.log(snapshot, "snapshot empty");
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
  // return snapshot.docs.map((doc) => {
  //   console.log(doc, "doc-2");
  //   return { id: doc.id, ...doc.data() };
  // });
};
// create document in a collection
exports.addDocument = async (collectionName, payload) => {
  const doc = await db.collection(collectionName).add(payload);
  return doc.id;
};

// update document in a collection
exports.updateDocument = async (collectionName, payload) => {
  await db.collection(collectionName).doc(payload.filter.id).update(payload.update);
};
// delete all documents
exports.deleteDocument = async (collectionName, payload) => {
  await db.collection(collectionName).doc(payload.id).delete();
};