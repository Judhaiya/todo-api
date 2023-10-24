const fs = require("fs");
/**
 * @param {string} filepath 
 * convertToBase64 converts provided filepath to base64 string
 * @returns base64 converted file path
 */
exports.convertToBase64 = (filepath) => {
  const fileToConvert = fs.readFileSync(filepath);
  return Buffer.from(fileToConvert).toString("base64");
};
