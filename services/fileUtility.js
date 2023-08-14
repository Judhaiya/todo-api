const fs = require("fs");
const { uploadFile } = require("../services/firebase/actionFunctions");

const deleteFileInDisk = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.deleteFileInDisk = deleteFileInDisk;

exports.uploadAndDeleteInDisk = async (fileDestination, bucketName) => {
  await uploadFile(fileDestination, bucketName);
  deleteFileInDisk(fileDestination);
};
