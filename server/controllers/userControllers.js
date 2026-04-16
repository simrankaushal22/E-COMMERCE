import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { verifyEmail } from "../emailVerify/verifyEmail.js";

export const  register= async(req,res)=>{
try {
    const{firstName,lastName,email,password}=req.body;
    if(!firstName||!lastName||!email||!password){
       return res.status(400).json(
        {
            success:false,
            message:"All fields are required"
        }
       )
        
    }
    const user= await User.findOne({email})
   if(user){
   return res.status(400).json({
        success:false,
        message:"user already exists"
    })
   }
const hashPassword= await bcrypt.hash(password,10)

    const newUser= await User.create({
        firstName,
        lastName,
        email,
        password:hashPassword
    })
const token = jwt.sign({id:newUser._id},process.env.SECRET_KEY,{expiresIn:'10m'})
verifyEmail(token,email)
newUser.token=token

    await newUser.save();
    return res.status(201).json({
        success:true,
        message:"User registered successfully",
        user:newUser
    })

} catch (error) {
   res.status(500).json({
    success:false,
    message:error.message
   })
    

}

}