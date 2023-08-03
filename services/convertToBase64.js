const fs = require("fs");
exports.convertToBase64 = (filepath) => {
  const fileToConvert = fs.readFileSync(filepath);
  return Buffer.from(fileToConvert).toString("base64");
};
