
const UsersData = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

// validation email
//  const emailValidation = () => {
//     const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
//     return emailRegex.test(emailValidation)
// }
const emailValidation = (givenValue) => {
  const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
  return emailRegex.test(givenValue)
}
exports.emailValidation = emailValidation
exports.signup = async (req, res) => {
  const email = req?.body?.email
  const userName = req?.body?.userName
  const password = req?.body?.password
  console.log(userName, "userName")
  try {
    const findEmail = await UsersData.findOne({ email })
    if (findEmail) {
      res.status(400).json({ msg: "User email already exists" })
    } else {
      console.log("no correlating email found")
    }
  } catch (err) {
    console.log(err, "error")
  }
  if (!emailValidation(email)) {
    res.status(400).json({ msg: "email is invalid" })
  }
  if (password.length > 6) {
    res.status(400).json({ msg: "password is invalid" })
  }
  if (password.length < 6) {
    res.status(400).json({ msg: "password is invalid" })
  }
  else {
    try {
      const newUser = new UsersData({
        email,
        userName,
        password
      }).save()
      // generate token
      const accessToken = jwt.sign({ payload: email, expiresIn: "2h" }, process.env.JWT_SECRET)
      console.log(accessToken)
      if (newUser) {
        res.status(200).json({
          msg: "User account has been created successfully",
          token: accessToken
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
}

exports.login = async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  try {
    const findEmail = await UsersData.findOne({ email })
    console.log(findEmail, "userdetails")
    const userPassword = findEmail.password
    if (!findEmail) {
      res.status(400).json({ msg: "Invalid User email" })
    } else {
      const validPassword = await bcrypt.compare(password, userPassword)
      if (!validPassword) {
        console.log(validPassword, password.toString() === userPassword, "vp")
        res.status(400).json({ msg: "Password doesn't match" })
      }
      else {
        const accessToken = jwt.sign({ payload: email, expiresIn: "2h" }, process.env.JWT_SECRET)
        console.log(accessToken)
        res.status(200).json({ msg: "User logged in successfully", token: accessToken })
      }
    }
  } catch (err) {
    console.log(err)
  }
}
