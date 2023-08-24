const chai = require("chai");
const { convertToBase64 } = require("../../services/convertToBase64");
const { downloadFileFromBucket } = require("../../services/firebase/actionFunctions");
const { deleteFileInDisk } = require("../../services/fileUtility");

const expect = chai.expect;

exports.checkForUploadedImg = async (downloadPath, uploadedImgPath, referencePath) => {
  await downloadFileFromBucket(referencePath, downloadPath);
  const base64responseUrl = convertToBase64(downloadPath);
  const base64userUploadedImg = convertToBase64(uploadedImgPath);
  expect(base64responseUrl).to.equal(base64userUploadedImg);
  deleteFileInDisk(downloadPath);
};
