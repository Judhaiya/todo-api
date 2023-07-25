exports.customError = (msg, code) => {
  const error = new Error();
  error.code = code;
  error.msg = msg;
  return error;
};
