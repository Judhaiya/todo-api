const admin = require("firebase-admin");
const dotenv = require("dotenv");
const serviceAccount = require("./serviceAccountKey.json");

dotenv.config();

// initializing firebase admin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_LOCATION
});

// accessing bucket from firebase admin storage
// accessing firestore from firebase admin

exports.bucket = admin.storage().bucket();
exports.db = admin.firestore();
