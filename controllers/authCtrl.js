
const UsersData = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
dotenv.config()

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
  try {
    const findEmail = await UsersData.findOne({ email })
    if (findEmail) {
      return res.status(400).json({ msg: "User email already exists" })
    } else {
      console.log("no correlating email found")
    }
    if (!emailValidation(email)) {
      return res.status(400).json({ msg: "email is invalid" })
    }
    if (password.length > 6) {
      return res.status(400).json({ msg: "password is invalid" })
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "password is invalid" })
    } else {
      const newUser = await new UsersData({
        email,
        userName,
        password
      }).save()
      // generate token
      const accessToken = jwt.sign({ payload: email, expiresIn: "2h" }, process.env.JWT_SECRET)
      console.log(accessToken)
      if (newUser) {
        return res.status(200).json({
          msg: "User account has been created successfully",
          token: accessToken
        })
      }
    }
  } catch (err) {
    console.log(err)
  }
}

exports.login = async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  try {
    const findEmail = await UsersData.findOne({ email })
    const userPassword = findEmail.password
    if (!findEmail) {
      return res.status(400).json({ msg: "Invalid User email" })
    } else {
      const validPassword = await bcrypt.compare(password.toString(), userPassword)
      if (!validPassword) {
        console.log(validPassword, password.toString() === userPassword, "vp")
        return res.status(400).json({ msg: "Password doesn't match" })
      } else {
        const accessToken = jwt.sign({ payload: email, expiresIn: "2h" }, process.env.JWT_SECRET)
        console.log(accessToken)
        return res.status(200).json({ msg: "User logged in successfully", token: accessToken })
      }
    }
  } catch (err) {
    console.log(err)
  }
}

exports.deleteUser = async (req, res) => {
  const email = req?.body?.email
  const password = req?.body?.password
  const bearerToken = req?.headers?.authorization
  const requiredToken = bearerToken?.split(" ")[1]
  try {
    if (email === "" && password === "" && bearerToken === undefined) return
    const validCredentials = await UsersData.findOne({ email })
    if (!validCredentials) {
      return res.status(400).json("please provide a valid email")
    }
    const validPassword = await bcrypt.compare(password.toString(), validCredentials.password)
    if (!validPassword) {
      return res.status(400).json("Password is invalid")
    }
    const validUser = jwt.verify(requiredToken, process.env.JWT_SECRET)
    if (!validUser) {
      return res.status(400).json("Token is invalid")
    }
    const isUserDeleted = await UsersData.deleteOne({ email: validCredentials?.email })
    if (isUserDeleted) {
      return res.status(200).json("User account has been successfully deleted")
    }
  } catch (err) {
    console.log(err, "error occured")
    return res.status(500).json("Something went wrong while sending request")
  }
}
