const UsersData = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { existingUser, comparePassword } = require("../utils/serviceFunction")
dotenv.config();

exports.saveUserData = async (userDetail) => {
  const { email, userName, password } = userDetail;
  console.log(email, "body in controller");
  const emailExists = await UsersData.findOne({ email });
  let isEmailFound = false;
  let accessToken;
  if (emailExists) {
    isEmailFound = true;
    accessToken = null;
    return [isEmailFound, accessToken];
  }
  await new UsersData({
    email,
    userName,
    password
  }).save();
  accessToken = jwt.sign({ payload: email, expiresIn: "2h" }, process.env.JWT_SECRET);
  console.log(accessToken, "accessToken");
  return [isEmailFound, accessToken];
};

exports.loginUser = async (userDetails) => {
  let success, msg, accessToken;
  try {
    const { email, password } = userDetails;
    console.log(await existingUser(email), email,
      "exst userDetails in ctrller file");
    const exstUserDetails = await existingUser(email);
    if (!exstUserDetails) {
      success = false;
      msg = "Invalid User email";
      return [success, msg, accessToken];
    }
    const encryptedPassword = exstUserDetails?.password;
    const isPasswordMatched = await bcrypt.compare(password.toString(), encryptedPassword);
    if (!isPasswordMatched) {
      success = false;
      msg = "Password doesn't match";
      return [success, msg, accessToken];
    }
    accessToken = jwt.sign({ payload: email }, process.env.JWT_SECRET);
    msg = "User logged in successfully";
    return [success, msg, accessToken];
  } catch (err) {
    console.log(err, "error occured during login");
  };
};

// exports.deleteUser = async (req, res) => {
//   try {
//     const { email, password } = req?.body;
//     const bearerToken = req?.headers?.authorization;
//     console.log(req.body, bearerToken, "re.body from deleteUser");
//     const requiredToken = bearerToken?.split(" ")[1];
//     if (email === "" && password === "" && bearerToken === undefined) { return; }
//     const existingDetails = await UsersData.findOne({ email });
//     if (!existingDetails) {
//       res.status(400).json({ msg: "email is invalid" });
//       return;
//     }
//     console.log(comparePassword(password), existingUser);
//     if (!comparePassword(password)) {
//       res.status(400).json({ msg: "Password is invalid" });
//       return;
//     }
//     const isJwtVerified = jwt.verify(requiredToken, process.env.JWT_SECRET);
//     if (!isJwtVerified) {
//       res.status(400).json({ msg: "Token is invalid" });
//       return;
//     }
//     await UsersData.deleteOne({ email: existingDetails?.email });
//     res.status(200).json({ msg: "Account has been successfully deleted" });
//   } catch (err) {
//     console.error(err, "error occured");
//     res.status(500).json({ msg: "Something went wrong while sending request" });
//   };
// };

exports.deleteAccount = async (req) => {
  let success, msg;
  try {
    const { email, password } = req.body;
    const bearerToken = req?.headers?.authorization;
    const requiredToken = bearerToken?.split(" ")[1];
    const exstUserDetails = await existingUser(email);
    if (!exstUserDetails) {
      success = false;
      msg = "Invalid User email";
      return [success, msg];
    }
    console.log(comparePassword, "cp");
    if (!comparePassword(password, email)) {
      success = false;
      msg = "Password is invalid";
      return [success, msg];
    }
    const isJwtVerified = jwt.verify(requiredToken, process.env.JWT_SECRET);
    if (!isJwtVerified) {
      success = false;
      msg = "Token is invalid";
      return [success, msg];
    }
    await UsersData.deleteOne({ email });
    success = true;
    msg = "Account has been successfully deleted";
  } catch (err) {
    console.error(err, "error occured");
  }
};
