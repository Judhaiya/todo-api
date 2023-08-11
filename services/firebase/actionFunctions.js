const { bucket } = require("../firebase/configuration");
const { getStorage, getDownloadURL } = require("firebase-admin/storage");
const dotenv = require("dotenv");

require(dotenv).config();

exports.uploadFile = async (fileDestination, bucketDestination) => {
  try {
    console.log(fileDestination, bucketDestination, "both destination");
    await bucket.upload(fileDestination, {
      destination: bucketDestination
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getDownlodableUrl = async (filepath) => {
  try {
    const fileRef = getStorage().bucket(process.env.FIREBASE_BUCKET_LOCATION).file(filepath);
    const downloadURL = await getDownloadURL(fileRef);
    console.log(downloadURL, "durl");
  } catch (err) {
    console.error(err);
  }
};
