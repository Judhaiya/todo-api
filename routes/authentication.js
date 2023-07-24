const express = require("express");
const { saveUserData, loginUser, deleteAccount } = require("../controllers/authentication");
const Validator = require("jsonschema").Validator;
const validateSchema = new Validator();

const router = express.Router();

const userSchema = {
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6, maxLength: 6 }
  },
  required: ["email", "password"]
};

const validateUserSchema = (userSchema, req) => {
  const userPayload = req.body.userName !== undefined ?
    { email: req.body.email, password: req.body.password, userName: req.body.userName }
    : { email: req.body.email, password: req.body.password };
  const result = validateSchema.validate(userPayload, userSchema);
  return result;
};

router.post("/signup", async (req, res) => {
  try {
    const signupSchema = {
      properties: { ...userSchema.properties, userName: { type: "string" } },
      required: [...userSchema.required, "userName"]
    };
    console.log(signupSchema, "signup");
    if (validateUserSchema(signupSchema, req).errors.length > 0) {
      const errorMsg = validateUserSchema(signupSchema, req).errors.map(err => err.stack);
      res.status(400).json({ msg: errorMsg?.toString() });
    }
    console.log(validateUserSchema(signupSchema, req), await saveUserData(req.body), "validateUserSchema");
    const [isEmailFound, token] = await saveUserData(req.body);

    if (isEmailFound) {
      res.status(400).json({ msg: "User email already exists" });
      return;
    }
    res.status(200).json({
      msg: "User account has been created successfully",
      token
    });
  } catch (err) {
    console.error(err, "error");
    res.status(500).json("something went wrong");
  }
});

router.post("/login", async (req, res) => {
  try {
    if (validateUserSchema(userSchema, req).errors.length > 0) {
      const errorMsg = validateUserSchema(userSchema, req).errors.map(err => err.stack);
      res.status(400).json({ msg: errorMsg?.toString() });
    }
    const [success, msg, accessToken] = await loginUser(req.body);
    if (success === false && accessToken === undefined) {
      res.status(400).json({ msg });
      return;
    }
    res.status(200).json({
      msg,
      token: accessToken
    });
  } catch (err) {
    console.error(err, "error");
    res.status(500).json("something went wrong");
  }
});

router.delete("/deleteUser", async (req, res) => {
  try {
    if (validateUserSchema(userSchema, req).errors.length > 0) {
      const errorMsg = validateUserSchema(userSchema, req).errors
        .map(err => err.stack);
      res.status(400).json({ msg: errorMsg?.toString() });
    }
    const [success, msg] = await deleteAccount(req);
    if (success === false) {
      res.status(400).json({ msg });
      return;
    }
    res.status(200).json({ msg });
  } catch (err) {
    console.error(err, "error");
    res.status(500).json("something went wrong");
  }
});

module.exports = router;
