var jwt = require('jsonwebtoken');
require('dotenv').config()
JWT_KEY=process.env.JWT_KEY

const fetchuser=(req,res,next)=>{
    //Get the user from jwt token and add id to req object
    const token=req.header("auth-token");
    if(!token){
        res.status(401).send({error:"Please authenticate using valid token!"})
    }
    try {
        const data=jwt.verify(token, JWT_KEY);
        req.user=data.user;
        next();
    } catch (error) {
        res.status(401).send({error:"Please authenticate using valid token!"})
    }
}

module.exports=fetchuser;