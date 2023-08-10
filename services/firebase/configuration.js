const admin = require("firebase-admin");
const dotenv = require("dotenv");
const serviceAccount = require("../firebase/serviceAccountkey.json");

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_LOCATION
});
