const express = require("express")
const { signup, login, deleteUser } = require("../controllers/authCtrl")
const router = express.Router()
router.post("/signup", signup)
router.post("/login", login)
router.delete("/deleteUser", deleteUser)
module.exports = router
