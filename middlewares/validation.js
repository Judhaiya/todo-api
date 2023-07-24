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
    err.name = "validation Error";
    err.code = errCode;
    err.msg = msg;
    return error;
}

exports.validateUserSchema = (req, next, error) => {
    const userPayload = req.body.userName !== undefined ?
        { email: req.body.email, password: req.body.password, userName: req.body.userName }
        : { email: req.body.email, password: req.body.password };

    const signupSchema = {
        properties: { ...userSchema.properties, userName: { type: "string" } },
        required: [...userSchema.required, "userName"]
    };

    const requiredSchema = req.path === "/api/auth/signup" ? signupSchema : userSchema;
    // const result = validateSchema.validate(userPayload, requiredSchema);
    // return result;
    if (validateSchema.validate(userPayload, requiredSchema).errors.length > 0) {
        const errorMsg = validateSchema(requiredSchema, req).errors.map(err => err.stack);
        // res.status(400).json({ msg: errorMsg?.toString() });
        throw CustomError(errorMsg?.toString(), 400);
    }
    next();
}