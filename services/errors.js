/**
 * @param {string} msg
 *  validation Error function makes an error instance
 *  assigns custom name,code,msg to error properties of error instance
 *  can be used while throwing validation error
 * @returns {Object} error
 */
exports.validationError = (msg) => {
  const error = new Error();
  error.name = "validation error";
  error.code = 400;
  error.msg = msg;
  return error;
};

/**
 * @param {string} msg
 *  request Error function makes an error instance
 *  assigns custom name,code,msg to error properties of error instance
 *  can be used while throwing request error
 * @returns {Object} error
 */
exports.requestError = (msg) => {
  const error = new Error();
  error.name = "request error";
  error.code = 400;
  error.msg = msg;
  return error;
};

/**
 * @param {Object} err 
 * @param {Object} res 
 * error handler checks for the error type and respond accordingly
 * for validation and request error (errors from client side) , 400 error would be thrown
 * for server error,500 would be thrown
 */

exports.errorHandler = (err, res) => {
  const { name, msg } = err;
  switch (name) {
    case "validation error":
      res.status(400).json({ msg });
      break;
    case "request error":
      res.status(400).json({ msg });
      break;
    default:
      console.error(err, "something went wrong err msg");
      res.status(500).json({ msg: "something went wrong" });
  }
};
