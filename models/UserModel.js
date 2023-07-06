const bcrypt = require("bcryptjs")
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

userSchema.pre('save',async(next)=>{
   bcrypt.genSalt(10)
   .then(salt=>{
    return bcrypt.hash(userSchema,salt)
   })
   .catch(err=>{
    console.log(err)
   })
   .then(hashedPassword=>{
    userSchema.password = hashedPassword
    next()
   })
   .catch(err=>{
    console.log(err)
   })
})
exports.module = mongoose.model('userModel',userSchema)