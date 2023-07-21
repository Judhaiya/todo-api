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

  // const result = validateSchema.validate({ email:"1234",
  //   password:123456,userName:"lotus" }, schemaTwo, { nestedErrors: true });
  // console.log(result, "validate user details")
  // console.log(result.errors.map(err => {
  //   if (err.property === "instance.email") {
  //     return `email is ${err.message}`;
  //   }
  //   if (err.property === "instance.password") {
  //     return `password is ${err.message}`;
  //   }
  //   return err.stack;
  // }), "res-be");
  console.log(user, "before saving to database but before password being hashed");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
  console.log(user, "user value before saving but after password being hashed");
  next();
});

const UsersData = mongoose.model("UsersData", userSchema);
module.exports = UsersData;
