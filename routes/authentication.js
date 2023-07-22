const express = require("express");
const { saveUserData, loginUser, deleteAccount } = require("../controllers/authentication");
const Validator = require("jsonschema").Validator;
const validateSchema = new Validator();

const router = express.Router();
router.post("/signup", async (req, res) => {
  const userSchema = {
    properties: {
      email: { type: "string", format: "email" },
      userName: { type: "string" },
      password: { type: "string", minLength: 6 }
    }
  };
  try {
    const result = validateSchema.validate({
      email: req.body.email,
      password: req.body.password,
      userName: req.body.userName
    }, userSchema);
    if (result.errors.length > 0) {
      const errorMsg = result.errors.map(err => err.stack);
      res.status(400).json({ msg: errorMsg?.toString() });
    }
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
  const userSchema = {
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 }
    },
    required: ["email", "password"]
  };
  const result = validateSchema.validate({
    email: req.body.email,
    password: req.body.password
  }, userSchema);
  if (result.errors.length > 0) {
    const errorMsg = result.errors.map(err => err.stack);
    res.status(400).json({ msg: errorMsg?.toString() });
  }
  try {
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
