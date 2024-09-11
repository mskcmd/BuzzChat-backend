const jwt = require("jsonwebtoken")

const generateToken=(id)=>{
return jwt.sign({id},'suhail701',{
    expiresIn:"30d"
})
}

module.exports=generateToken