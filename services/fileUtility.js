const fs = require("fs");
const { uploadFile } = require("../services/firebase/actionFunctions");

exports.deleteFileInDisk = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error(error.message);
  }
};
