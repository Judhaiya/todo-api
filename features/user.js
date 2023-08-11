const { generateToken, verifyToken } = require("../services/token");
const { requestError } = require("../services/errors");
const bcrypt = require("bcrypt");
const { addCollection, readCollection, deleteCollection } = require("../services/mongodb/actionFunctions");

exports.comparePassword = async function (password, email) {
  try {
    const userDetails = await readCollection("users", { email });
    return bcrypt.compare(password.toString(), userDetails?.password);
  } catch (err) {
    console.error("comapre password error", err);
    throw requestError("no valid password found");
  };
};
const comparePassword = exports.comparePassword;
exports.userSignup = async (userDetail) => {
  const { email, userName, password } = userDetail;
  if (await readCollection("users", { email })) {
    throw requestError("User email already exists");
  }
  await addCollection("users", {
    email,
    userName,
    password
  });
  const accessToken = generateToken(email);
  return accessToken;
};

exports.userLogin = async function (userDetails) {
  const { email, password } = userDetails;
  const existingUser = await readCollection("users", { email });
  if (!existingUser) {
    throw requestError("Invalid User email");
  }
  if (!await comparePassword(password, email)) {
    throw requestError("Password doesn't match");
  }
  const accessToken = generateToken(email);
  return accessToken;
};

exports.deleteUserAccount = async function (req) {
  const { email, password } = req.body;
  const userDetails = await readCollection("users", { email });
  if (!userDetails) {
    throw requestError("Invalid User email");
  }
  if (!await comparePassword(password, email)) {
    throw requestError("Password doesn't match");
  }
  await deleteCollection("users", { email });
};
