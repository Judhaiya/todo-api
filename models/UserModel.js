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
  console.log(user, "this")
  bcrypt.genSalt(10)
    .then(salt => {
      console.log(user.password)
      return bcrypt.hash(user.password, salt)
    })
    .catch(err => {
      console.log(err)
    })
    .then(hashedPassword => {
      console.log(hashedPassword, "hp")
      user.password = hashedPassword
      // console.log(user, "password")

      return next(null, user)
    })
    .catch(err => {
      console.log(err)
    })
})
// userSchema.post("save", async function () {
//   const user = this
//   console.log("userdetails after saving", user)
// })
const UsersData = mongoose.model("UsersData", userSchema)
module.exports = UsersData
