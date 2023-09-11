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
            id: { type: "string", minLength: 1 }
          },
          required: ["id"]
        };
        break;
      case "/updateTodo":
        requiredSchema = {
          properties: {
            id: { type: "string", minLength: 1 },
            taskName: { type: "string" },
            image: { type: "string" }
          },
          required: ["id"]
        };
        break;
      case "/deleteTodo":
        requiredSchema = {
          properties: {
            id: { type: "string", minLength: 1 }
          },
          required: ["id"]
        };
        break;
      default:
        throw new Error(`${path} is invalid path`);
    }
    return requiredSchema;
  } catch (err) {
    console.error(err, "invalid path");
  }
};
function preValidateProperty(path, file, taskName) {
  if (path !== "/updateTodo") {
    return;
  }
  if (file === undefined && taskName === undefined) {
    throw validationError("image and taskName shouldn't be empty");
  }
}
exports.validateUserSchema = async (req, res, next) => {
  let userValue;
  try {
    userValue = req.body;
    if (req.method === "GET") {
      userValue = req.query;
    }
    if (
      validateSchema.validate(userValue, getUserSchema(req.path), {
        preValidateProperty: preValidateProperty(
          req.path,
          req.file,
          req.body.taskName
        )
      }).errors.length > 0
    ) {
      const errorMsg = validateSchema
        .validate(userValue, getUserSchema(req.path))
        .errors.map((err) => err.stack);
      throw validationError(errorMsg?.toString());
    }
    next();
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
};
