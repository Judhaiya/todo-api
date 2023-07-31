const Validator = require("jsonschema").Validator;
const { validationError, errorHandler } = require("../services/errors");

const validateSchema = new Validator();

const getUserSchema = (path) => {
  try {
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
      case "/login":
        requiredSchema = {
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6, maxLength: 6 }
          },
          required: ["email", "password"]
        };
        break;
      case "/deleteUser":
        requiredSchema = {
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6, maxLength: 6 }
          },
          required: ["email", "password"]
        };
        break;
      default:
        throw new Error(`${path} is invalid path`);
    };
    return requiredSchema;
  } catch (err) {
    console.error(err, "invalid path");
  }
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
