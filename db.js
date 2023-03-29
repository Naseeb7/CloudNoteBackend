const mongoose=require("mongoose");
require('dotenv').config()
const mongoURI=process.env.Database

const connectToMongo=async ()=>{
    await mongoose.connect(mongoURI)
    console.log("Connected")
}
module.exports=connectToMongo