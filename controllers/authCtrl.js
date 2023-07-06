 const users = require("../models/UserModel")
 const jwt = require("jsonwebtoken")
 require(dotenv).config()
 // validation email
 const emailValidation = () => {
    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    return emailRegex.test(emailValidation)
}
exports.signup = async(req)=>{
  const email = req?.body?.email;
  const userName = req?.body?.userName;
  const password = req?.body?.password

  const findEmail =users.findOne({email : req?.body?.email}) 
  if (findEmail){
      res.status(400).json("User name already exists")
  }
  else if (!emailValidation(email)){
    res.status(400).json("Please enter a valid email")
  }
  else if (password.length > 6){
    res.status(400).json("password length should not be less than 6")
  }
  else {
    try {
    const newUser =  new User({
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