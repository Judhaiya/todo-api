const Validator = require("jsonschema").Validator;
const { validationError, errorHandler } = require("../services/errors");

const validateSchema = new Validator();

/**
 * takes api route as an argument based on api route,returns validation object to api route based on the request body
 *
 * @param {string} path
 * @return {Object} validation schema for respective request body
 * *@example  requiredSchema ={
 *  properties:{
 *   email:{type:"string",format:"email"},
 *   password:{type:"string",minLength:6,maxLength:8}
 * }
 * }
 */
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

/**
 * prevalidate property runs before actual validation executes
 * @param {string} file
 * @param {string} path
 * @param {string} taskName    
   * prevalidate property will be skipped for all the routes except updateTodo route
   * if the route is update todo and  if file and taskName is undefined,error will be thrown
 */

function preValidateProperty(path, file, taskName) {
  if (path !== "/updateTodo") {
    return;
  }
  if (file === undefined && taskName === undefined) {
    throw validationError("image and taskName shouldn't be empty");
  }
}

/**
 * validateUserSchema takes in req,res,next as arguments
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 * if it is a get request, request info should be taken from req.query else from
 * req.path/req.file/req.body.taskname based on the nature of api route
 * if in any scenario,req object fails in any of the validations for that particular route,
 * it will throw an error stating the reason for disqualification
 * next function will not be execution,function stops here
 * if it passes all the validations,next function will be executed and will pass control to succeeding middleware 
 * if there is any
 */
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
