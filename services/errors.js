exports.validationError = (msg) => {
  const error = new Error();
  error.name = "validation error";
  error.code = 400;
  error.msg = msg;
  return error;
};
exports.requestError = (msg) => {
  const error = new Error();
  error.name = "request error";
  error.code = 400;
  error.msg = msg;
  return error;
};

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
      console.error(err, "error 500");
      res.status(500).json({ msg: "something went wrong" });
  }
};
