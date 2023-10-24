const fs = require("fs");
/**
 * @param {string} filePath 
 *  deleteFileInDisk deletes the file in disk (eg /tmp folder)
 * by taking of file that needs to be deleted
 */
exports.deleteFileInDisk = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error(error.message);
  }
};
