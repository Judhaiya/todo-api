const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}
)

userSchema.pre("save", async function (next) {
  const user = this
  console.log(user, "this after save")
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(user.password, salt)
  user.password = hashedPassword
  next()
  console.log(user, "pre-save-complete")
})

const UsersData = mongoose.model("UsersData", userSchema)
module.exports = UsersData
