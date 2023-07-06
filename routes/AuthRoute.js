const express = require("express");
const {signup} = require("../controllers/authCtrl")
const router = express.Router()
router.post("/signup",signup)
module.exports = router