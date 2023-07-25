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
const getPayload = (path, payloadDetails) => {
  let requiredPayload;
  switch (path) {
    case "/signup":
      requiredPayload = { email: payloadDetails.email, password: payloadDetails.password, userName: payloadDetails.userName };
      break;
    default:
      requiredPayload = { email: payloadDetails.email, password: payloadDetails.password };
  }
  return requiredPayload;
};

exports.validateUserSchema = async (req, res, next) => {
  try {
    if (validateSchema.validate(getPayload(req.path, req.body), getUserSchema(req.path)).errors.length > 0) {
      const errorMsg = validateSchema.validate(getPayload(req.path, req.body), getUserSchema(req.path)).errors.map(err => err.stack);
      throw validationError(errorMsg?.toString());
    }
    next();
  } catch (err) {
    console.error(err);
    errorHandler(err.name, res, err.msg);
  }
};
