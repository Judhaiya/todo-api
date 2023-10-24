const express = require("express");
const { saveUserData, loginUser, deleteAccount } = require("../controllers/authentication");
const { validateUserSchema } = require("../middlewares/validation");
const { validateToken } = require("../middlewares/tokenValidation");
const { errorHandler } = require("../services/errors");

const router = express.Router();

router.use(express.json());

/**
 * @api {post} /auth/signup  signup user/create new user
 * @apiName signup user
 * @apiGroup auth
 * @apiBody (Login) {Object} payload
 * @apiBody (Login) {String} payload.email
 * @apiBody (Login) {String} payload.password
 * @apiSuccessExample {Object} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *  msg: "User account has been created successfully",
 *  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsInVzZXJuYW1lIjoia21pbmNoZWxsZSIsImVtYWlsIjoia21pbmNoZWxsZUBxcS5jb20iLCJmaXJzdE5hbWUiOiJKZWFubmUiLCJsYXN0TmFtZSI6IkhhbHZvcnNvbiIsImdlbmRlciI6ImZlbWFsZSIsImltYWdlIjoiaHR0cHM6Ly9yb2JvaGFzaC5vcmcvYXV0cXVpYXV0LnBuZz9zaXplPTUweDUwJnNldD1zZXQxIiwiaWF0IjoxNjM1NzczOTYyLCJleHAiOjE2MzU3Nzc1NjJ9.n9PQX8w8ocKo0dMCw3g8bKhjB8Wo7f7IONFBDqfxKhs"
 * }
}
*/

router.post("/signup", validateUserSchema, async (req, res) => {
  try {
    const token = await saveUserData(req.body);
    res.status(200).json({
      msg: "User account has been created successfully",
      token
    });
  } catch (err) {
    console.error(err, "error");
    errorHandler(err, res);
  }
});

/**
 * @api {post} /auth/login  login already created user account
 * @apiName login user
 * @apiGroup auth
 * @apiBody (Login) {Object} payload
 * @apiBody (Login) {String} payload.email
 * @apiBody (Login) {String} payload.password
 * @apiSuccessExample {Object} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *  msg: "User logged in successfully",
 *  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsInVzZXJuYW1lIjoia21pbmNoZWxsZSIsImVtYWlsIjoia21pbmNoZWxsZUBxcS5jb20iLCJmaXJzdE5hbWUiOiJKZWFubmUiLCJsYXN0TmFtZSI6IkhhbHZvcnNvbiIsImdlbmRlciI6ImZlbWFsZSIsImltYWdlIjoiaHR0cHM6Ly9yb2JvaGFzaC5vcmcvYXV0cXVpYXV0LnBuZz9zaXplPTUweDUwJnNldD1zZXQxIiwiaWF0IjoxNjM1NzczOTYyLCJleHAiOjE2MzU3Nzc1NjJ9.n9PQX8w8ocKo0dMCw3g8bKhjB8Wo7f7IONFBDqfxKhs"
 * }
}
*/

router.post("/login", validateUserSchema, async (req, res) => {
  try {
    const accessToken = await loginUser(req.body);
    res.status(200).json({
      msg: "User logged in successfully",
      token: accessToken
    });
  } catch (err) {
    console.error(err, "error");
    errorHandler(err, res);
  }
});

/**
 * @api {delete} /auth/login  delete User account
 * @apiName login user
 * @apiGroup auth
 * @apiBody (Login) {Object} payload
 * @apiBody (Login) {String} payload.email
 * @apiBody (Login) {String} payload.password
 * @apiSuccessExample {Object} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *  msg: "Account has been successfully deleted",
 * }
}
*/

router.delete("/deleteUser", validateToken, validateUserSchema, async (req, res) => {
  try {
    await deleteAccount(req);
    res.status(200).json({ msg: "Account has been successfully deleted" });
  } catch (err) {
    console.error(err, "error");
    errorHandler(err, res);
  }
});

module.exports = router;
