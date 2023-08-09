const { readCollection } = require("../services/mongodb/actionFunctions");
const { verifyToken } = require("../services/token");
const { validationError, errorHandler } = require("../services/errors");

exports.validateToken = async (req, res, next) => {
  try {
    const requiredToken = req?.headers?.authorization?.split(" ")[1];
    const userDetails = await readCollection("users", { email: req?.body?.email });
    if (verifyToken(requiredToken).payload !== userDetails) {
      throw validationError("invalid Token");
    }
    next();
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
};
