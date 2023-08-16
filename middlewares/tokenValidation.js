const { verifyToken } = require("../services/token");
const { requestError, errorHandler } = require("../services/errors");

exports.validateToken = async (req, res, next) => {
  try {
    const requiredToken = req?.headers?.authorization?.split(" ")[1];
    if (!verifyToken(requiredToken)) {
      throw requestError("invalid Token");
    }
    next();
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
};
