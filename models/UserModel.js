const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  userName:{
    type:String,
    required:true
   },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  }
}
)

userSchema.pre('save',async function(next){
  let user = this
  console.log(user,"this")
   bcrypt.genSalt(10)
   .then(salt=>{
    console.log(user.password)
    return bcrypt.hash(user.password,salt)
   })
   .catch(err=>{
    console.log(err)
   })
   .then(hashedPassword=>{
    userSchema.password = hashedPassword
    console.log(hashedPassword,"hp")
    next()
   })
   .catch(err=>{
    console.log(err)
   })
})
let UsersData = mongoose.model('UsersData',userSchema)
module.exports = UsersData