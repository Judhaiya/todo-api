const { bucket } = require("./configuration");
const { getStorage, getDownloadURL } = require("firebase-admin/storage");
const dotenv = require("dotenv");
const { deleteFileInDisk } = require("../../services/fileUtility");

dotenv.config();

exports.uploadFile = async (fileDestination, bucketDestination) => {
  try {
    await bucket.upload(fileDestination, {
      destination: bucketDestination
    });
    if (fileDestination.split("/")[0] === "tmp") {
      deleteFileInDisk(fileDestination);
    }
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

exports.deleteFileInStorage = async (bucketDestination) => {
  try {
    await bucket.file(bucketDestination).delete();
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

exports.getDownlodableUrl = async (filepath) => {
  try {
    const fileRef = getStorage().bucket(process.env.FIREBASE_BUCKET_LOCATION).file(filepath);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

exports.downloadFileFromBucket = async (bucketLocation, downloadLocation) => {
  try {
    const res = bucket.file(bucketLocation).download({ destination: downloadLocation });
    return res;
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};
