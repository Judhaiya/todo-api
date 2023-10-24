const { bucket } = require("./configuration");
const { getStorage, getDownloadURL } = require("firebase-admin/storage");
const dotenv = require("dotenv");
const { deleteFileInDisk } = require("../../services/fileUtility");
const { requestError } = require("../errors");

dotenv.config();

/** 
* @param {string} fileDestination
* @param {string} bucketDestination
* upload File function puts local file in firebase storage bucket by taking in file destination,
storage bucket location
 */

exports.uploadFile = async (fileDestination, bucketDestination) => {
  try {
    await bucket.upload(fileDestination, {
      destination: bucketDestination
    });
    deleteFileInDisk(fileDestination);
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

/**
 * @param {string} bucketDestination 
 * deleteFileinStorage deletes file in storage by taking in bucket destination
 */
exports.deleteFileInStorage = async (bucketDestination) => {
  try {
    await bucket.file(bucketDestination).delete();
  } catch (err) {
    console.error(err, "error in deleting file");
    throw requestError(err?.errors[0]?.reason);
  }
};

/**
 * @param {string} filepath 
 * @returns {string} downloadURL
 * getDownloadableUrl generates downloable url by taking in filepath
 * throws error if something goes wrong while generating url
 */

exports.getDownlodableUrl = async (filepath) => {
  try {
    const fileRef = getStorage()
      .bucket(process.env.FIREBASE_BUCKET_LOCATION)
      .file(filepath);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

/**
 * 
 * @param {string} bucketLocation 
 * @param {string} downloadLocation 
 * download files from storage bucket after passing the uploaded file location and 
 * downloads the file in the disk location
 */

exports.downloadFileFromBucket = async (bucketLocation, downloadLocation) => {
  try {
    const res = bucket
      .file(bucketLocation)
      .download({ destination: downloadLocation });
    return res;
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};
