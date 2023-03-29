require("dotenv").config();
const express=require("express");
const User=require("../Models/Users")
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fetchuser=require("../Middleware/fetchuser")

JWT_KEY=process.env.JWT_KEY

//ROUTE 1 : Create a user using: POST "/api/auth/createuser". No login required
router.post("/createuser",[
  body('email',"Enter a valid e-mail").isEmail(),
  body('name',"Enter a valid name").isLength({ min: 3 }),
  body('password',"Password must be at least 5 characters").isLength({ min: 5 }),
],async (req,res)=>{
  //If there are errors return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // check wheather the user with same email exists already
  try {
    let  user=await User.findOne({email:req.body.email});
    if(user){
      success=false;
      return res.status(400).json({success,error:"Sorry a user with this email already exists"})
    }
    const salt=await bcrypt.genSalt(10);
    const secPassword=await bcrypt.hash(req.body.password,salt)
    user=await User.create({
      name: req.body.name,
      password: secPassword,
      email: req.body.email
    });
    const data={
      user:{
        id: user.id
      }
    }
    const authtoken=jwt.sign(data,JWT_KEY);
    success=true;
    res.json({success,authtoken})
  } catch (error) {
    console.error(error.message);
    success=false;
    res.status(500).send({success,error:"Internal server error!"})
  }
})
//ROUTE 2 : Authenticate a user using: POST "/api/auth/login". No login required
router.post("/login",[
  body('email',"Enter a valid e-mail").isEmail(),
  body('password',"Password cannot be blank").exists(),
],async (req,res)=>{
//If there are errors return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email, password}=req.body;
  try {
    let user= await User.findOne({email});
    // console.log(user.email);
    if(!user){
      success=false;
      return res.status(400).json({success,error:"Incorrect email"})
    }
    const passwordCompare=await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      success=false;
      return res.status(400).json({success,error:"Please try to login with correct credentials"})
    }
    const data={
      user:{
        id: user.id
      }
    }
    const authtoken=jwt.sign(data,JWT_KEY);
    success=true;
    res.json({success,authtoken})
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error!")
  }
})

//ROUTE 3 : Getting user details using : POST "/api/auth/getuser". login required
router.post("/getuser",fetchuser,async (req,res)=>{
try {
  let userId=req.user.id
  const user=await User.findById(userId).select("-password");
  success=true;
  res.send({success,user})
} catch (error) {
  console.error(error);
  res.status(500).send("Internal server error!")
}
})

//ROUTE 4 : Changing password using user details : POST "/api/auth/userpwd". login required
router.post("/userpwd",fetchuser,async (req,res)=>{
  const {password,oldpassword}=req.body
  try {
    let userId=req.user.id
    const user=await User.findById(userId).select("password");
    const pwdcompare=await bcrypt.compare(oldpassword,user.password)
    console.log(pwdcompare)
    if(pwdcompare){
  const salt=await bcrypt.genSalt(10);
  const secPassword=await bcrypt.hash(password,salt)
    // console.log(user.password)
    const pwdcompare=await bcrypt.compare(password,user.password)
    // console.log(pwdcompare)
    if(!pwdcompare){
  const pwdupdate=await User.findByIdAndUpdate(userId,{password:secPassword},{new:true});
  success=true;
  res.send({success})
    }
    else{
      success=false;
      res.send({success,error:"same"})
    }
  }
  else{
    success=false;
    res.send({success,error:"invalid"})
  }
} catch (error) {
  console.error(error);
  res.status(500).send("Internal server error!")
}
})
module.exports=router