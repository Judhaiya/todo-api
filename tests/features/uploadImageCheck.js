const chai = require("chai");
const { convertToBase64 } = require("../../services/convertToBase64");
const { downloadFileFromBucket } = require("../../services/firebase/actionFunctions");
const { deleteFileInDisk } = require("../../services/fileUtility");

const expect = chai.expect;

exports.checkForUploadedImg = async (downloadedPath, uploadedImgPath, referencePath) => {
  await downloadFileFromBucket(referencePath, uploadedImgPath);
  const base64responseUrl = convertToBase64(downloadedPath);
  const base64userUploadedImg = convertToBase64(uploadedImgPath);
  expect(base64responseUrl).to.equal(base64userUploadedImg);
  deleteFileInDisk(uploadedImgPath);
};
