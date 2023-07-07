 
const UsersData = require("../models/UserModel")
 const jwt = require("jsonwebtoken")

 // validation email
 const emailValidation = () => {
    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    return emailRegex.test(emailValidation)
}
exports.signup = async(req,res)=>{
  const email = req?.body?.email;
  const userName = req?.body?.userName;
  const password = req?.body?.password
  console.log(userName,"userName")
// console.log(findEmail,"find e") 
const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
  try {
    const findEmail = await UsersData.findOne({email })
    if (findEmail){
      res.status(400).json("User email already exists")
  } else{
    console.log("no correlating email found")
  }
  }catch(err){
    console.log(err,"error")
  }
   if (!emailRegex.test(email)){
     res.status(400).json("Please enter a valid email")
  }
    if (password.length > 6){
    res.status(400).json("password length should not be less than 6")
  }
  else {
    try {
    const newUser =  new UsersData({
        email,
        userName,
        password
    }).save()
    // generate token
    let accessToken = jwt.sign({payload:email,expiresIn:"2h"},process.env.JWT_SECRET)
    console.log(accessToken)
    if(newUser){
        res.status(200).json({msg:"user details has been successfully stored in db",
         token:accessToken
         })
    }
  }
  catch(err){
   console.log(err)
  }
}

}