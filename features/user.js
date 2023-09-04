const { generateToken } = require("../services/token");
const { requestError } = require("../services/errors");
const bcrypt = require("bcrypt");
const {
  addDocument,
  read,
  deleteDocument
} = require("../services/firebase/firestore.queries");

exports.comparePassword = async function (password, email) {
  try {
    const userDetails = await read.singleByKey("users", { email });
    return bcrypt.compare(password.toString(), userDetails?.password);
  } catch (err) {
    console.error("comapre password error", err);
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
    hashedPassword
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
