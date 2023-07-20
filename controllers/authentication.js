const UsersData = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { emailValidation } = require("../utils/serviceFunction");

dotenv.config();

exports.signup = async (req, res) => {
  try {
    const { email, userName, password } = req?.body;
    const emailExists = await UsersData.findOne({ email });
    if (emailExists) {
      res.status(400).json({ msg: "User email already exists" });
      return;
    }
    if (!emailValidation(email)) {
      res.status(400).json({ msg: "email is invalid" });
      return;
    }
    if (password.length > 6) {
      res.status(400).json({ msg: "password is invalid" });
      return;
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "password is invalid" });
    }
    await new UsersData({
      email,
      userName,
      password
    }).save();
    // generate token
    const accessToken = jwt.sign({ payload: email, expiresIn: "2h" }, process.env.JWT_SECRET);
    res.status(200).json({
      msg: "User account has been created successfully",
      token: accessToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong while sending request" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const detailsExists = await UsersData.findOne({ email });
    const encryptedPassword = detailsExists?.password;
    if (!detailsExists) {
      res.status(400).json({ msg: "Invalid User email" });
      return;
    }
    const isPasswordMatched = await bcrypt.compare(password.toString(), encryptedPassword);
    if (!isPasswordMatched) {
      res.status(400).json({ msg: "Password doesn't match" });
      return;
    }
    const accessToken = jwt.sign({ payload: email }, process.env.JWT_SECRET);
    console.log(accessToken);
    res.status(200).json({ msg: "User logged in successfully", token: accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong while sending request" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const bearerToken = req?.headers?.authorization;
    console.log(req.body, bearerToken, "re.body from deleteUser");
    const requiredToken = bearerToken?.split(" ")[1];
    if (email === "" && password === "" && bearerToken === undefined) { return; }
    const existingDetails = await UsersData.findOne({ email });
    if (!existingDetails) {
      res.status(400).json({ msg: "email is invalid" });
      return;
    }
    const isPasswordMatched = await bcrypt.compare(password.toString(), existingDetails?.password);
    if (!isPasswordMatched) {
      res.status(400).json({ msg: "Password is invalid" });
      return;
    }
    const isJwtVerified = jwt.verify(requiredToken, process.env.JWT_SECRET);
    if (!isJwtVerified) {
      res.status(400).json({ msg: "Token is invalid" });
      return;
    }
    await UsersData.deleteOne({ email: existingDetails?.email });
    res.status(200).json({ msg: "Account has been successfully deleted" });
  } catch (err) {
    console.error(err, "error occured");
    res.status(500).json({ msg: "Something went wrong while sending request" });
  };
};
