const Validator = require("jsonschema").Validator;
const validateSchema = new Validator();

const userSchema = {
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6, maxLength: 6 }
  },
  required: ["email", "password"]
};
const CustomError = (msg, errCode) => {
  const error = new Error();
  error.name = "validation Error";
  error.code = errCode;
  error.msg = msg;
  return error;
};

exports.validateUserSchema = async (req, res, next) => {
  try {
    const userPayload = req.body.userName !== undefined ?
      { email: req.body.email, password: req.body.password, userName: req.body.userName }
      : { email: req.body.email, password: req.body.password };

    const signupSchema = {
      properties: { ...userSchema.properties, userName: { type: "string" } },
      required: [...userSchema.required, "userName"]
    };

    const requiredSchema = req.path === "/signup" ? signupSchema : userSchema;
    if (validateSchema.validate(userPayload, requiredSchema).errors.length > 0) {
      const errorMsg = validateSchema.validate(userPayload, requiredSchema).errors.map(err => err.stack);
      throw CustomError(errorMsg?.toString(), 400);
    }
    next();
  } catch (err) {
    if (err.code !== 400) {
      res.status(500).json({ msg: "something went wrong" });
      return;
    }
    console.error(err);
    res.status(err?.code).json({ msg: err?.msg });
  }
};
