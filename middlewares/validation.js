const Validator = require("jsonschema").Validator;
const { validationError, errorHandler } = require("../services/errors");

const validateSchema = new Validator();

const getUserSchema = (path) => {
  let requiredSchema;
  switch (path) {
    case "/signup":
      requiredSchema = {
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6, maxLength: 6 },
          userName: { type: "string" }
        },
        required: ["email", "password", "userName"]
      };
      break;
    default:
      requiredSchema = {
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6, maxLength: 6 }
        },
        required: ["email", "password"]
      };
  };
  return requiredSchema;
};

exports.validateUserSchema = async (req, res, next) => {
  try {
    if (validateSchema.validate(req.body, getUserSchema(req.path)).errors.length > 0) {
      const errorMsg = validateSchema.validate(req.body, getUserSchema(req.path)).errors.map(err => err.stack);
      throw validationError(errorMsg?.toString());
    }
    next();
  } catch (err) {
    console.error(err);
    errorHandler(err.name, res, err.msg);
  }
};
