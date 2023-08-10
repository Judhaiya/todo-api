const { initializeApp, cert } = require("firebase-admin/app");
const dotenv = require("dotenv");

dotenv.config();

const serviceAccount = require("./serviceAccountkey.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_LOCATION
});
