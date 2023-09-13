const { generateToken } = require("../services/token");
const { requestError } = require("../services/errors");
const bcrypt = require("bcrypt");
const {
  addDocument,
  read,
  deleteDocument
} = require("../services/firebase/firestore.queries");

/**
 *  making password comparison  to check whether user entered password and password stored in db matches 
 * @param {string} password - password of user
 *   @param {string} email -  user email
  */

exports.comparePassword = async function (password, email) {
  try {
    /** read user details from database by passing user email */
    const userDetails = await read.singleByKey("users", { email });
    return bcrypt.compare(password.toString(), userDetails?.password);
  } catch (err) {
    /** throw request error if the password is invalid */
    throw requestError("no valid password found");
  }
};
const comparePassword = exports.comparePassword;

exports.userSignup = async (userDetail) => {
  const { email, userName, password } = userDetail;
  if (await read.singleByKey("users", { email })) {
    throw requestError("User email already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await addDocument("users", {
    email,
    userName,
    password: hashedPassword
  });
  const accessToken = generateToken(email);
  return accessToken;
};

exports.userLogin = async function (userDetails) {
  const { email, password } = userDetails;
  const existingUser = await read.singleByKey("users", { email });
  if (!existingUser) {
    throw requestError("Invalid User email");
  }
  if (!(await comparePassword(password, email))) {
    throw requestError("Password doesn't match");
  }
  const accessToken = generateToken(email);
  return accessToken;
};

exports.deleteUserAccount = async function (req) {
  const { email, password } = req.body;
  const userDetails = await read.singleByKey("users", { email });
  if (!userDetails) {
    throw requestError("Invalid User email");
  }
  if (!(await comparePassword(password, email))) {
    throw requestError("Password doesn't match");
  }
  await deleteDocument.deleteDocumentByKey("users", { email });
};
