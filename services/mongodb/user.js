const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}
);
userSchema.pre("save", async function (next) {
  const user = this;
  console.log(user, "before saving to database but before password being hashed");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
  console.log(user, "user value before saving but after password being hashed");
  next();
});

const UsersData = mongoose.model("UsersData", userSchema);
module.exports = UsersData;
