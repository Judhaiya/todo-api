const express = require("express");
const { saveUserData, loginUser, deleteAccount } = require("../controllers/authentication");
const { validateUserSchema } = require("../middlewares/validation");
const { errorHandler } = require("../services/errors");

const router = express.Router();

router.post("/signup", validateUserSchema, async (req, res) => {
  try {
    const token = await saveUserData(req.body);
    res.status(200).json({
      msg: "User account has been created successfully",
      token
    });
  } catch (err) {
    console.error(err, "error");
    errorHandler(err.name, res, err.msg);
  }
});

router.post("/login", validateUserSchema, async (req, res) => {
  try {
    const accessToken = await loginUser(req.body);
    res.status(200).json({
      msg: "User logged in successfully",
      token: accessToken
    });
  } catch (err) {
    console.error(err, "error");
    errorHandler(err.name, res, err.msg);
  }
});
router.delete("/deleteUser", validateUserSchema, async (req, res) => {
  try {
    await deleteAccount(req);
    res.status(200).json({ msg: "Account has been successfully deleted" });
  } catch (err) {
    console.error(err, "error");
    errorHandler(err.name, res, err.msg);
  }
});

module.exports = router;
