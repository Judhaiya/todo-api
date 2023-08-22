const Validator = require("jsonschema").Validator;
const { validationError, errorHandler } = require("../services/errors");

const validateSchema = new Validator();

Validator.prototype.customFormats.idFormat = function (input) {
  const mongoDbIdRegex = new RegExp("^[0-9a-fA-F]{24}$")
  return mongoDbIdRegex.test(input);
};
const getUserSchema = (path) => {
  try {
    let requiredSchema;
    switch (path) {
      case "/signup":
        requiredSchema = {
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6, maxLength: 12 },
            userName: { type: "string" }
          },
          required: ["email", "password", "userName"]
        };
        break;
      case "/login":
        requiredSchema = {
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6, maxLength: 12 }
          },
          required: ["email", "password"]
        };
        break;
      case "/deleteUser":
        requiredSchema = {
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6, maxLength: 12 }
          },
          required: ["email", "password"]
        };
        break;
      case "/createTodo":
        requiredSchema = {
          properties: {
            taskName: { type: "string" },
            image: { type: "string" }
          },
          required: ["taskName"]
        };
        break;
      case "/getSingleTodo":
        requiredSchema = {
          properties: {
            id: { type: "string", format: "idFormat" }
          },
          required: ["id"]
        };
        break;
      case "/updateTodo":
        requiredSchema = {
          properties: {
            id: { type: "string", format: "idFormat" },
            taskName: { type: "string" },
            image: { type: "string" }
          },
          required: ["id"]
        };
        break;
      case "/deleteTodo":
        requiredSchema = {
          properties: {
            id: { type: "string", format: "idFormat" }
          },
          required: ["id"]
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
function preValidateProperty(req) {
  if (req.path !== "/updateTodo") {
    return;
  }
  if (req.file === undefined && req.body.taskName === undefined) {
    throw validationError("image or taskName shouldn't be empty");
  }
}
exports.validateUserSchema = async (req, res, next) => {
  let userValue;
  try {
    userValue = req.body;
    if (req.method === "GET") {
      userValue = req.query;
    }
    if (validateSchema.validate(userValue, getUserSchema(req.path)
      , { preValidateProperty: preValidateProperty(req) }).errors.length > 0) {
      const errorMsg = validateSchema.validate(userValue, getUserSchema(req.path)).errors.map(err => err.stack);
      throw validationError(errorMsg?.toString());
    }
    next();
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
};
