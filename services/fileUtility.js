const fs = require("fs");

exports.deleteFileInDisk = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error(error.message);
  }
};
