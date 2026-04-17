import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { Session } from "../models/sessionModel.js";

//register controller
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "user already exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "30m",
    });
    verifyEmail(token, email);
    newUser.token = token;

    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//verify controller
export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "authorization token is messing or invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredToken") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    user.token = null;
    user.isVerified = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//reVerify controller

export const reVerify= async (req,res)=>{
    try {
        const {email}= req.body;
        const user= await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
  const token= jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"30m"})
        verifyEmail(token,email)
        user.token=token
        await user.save()
        return res.status(200).json({
            success:true,
            message:"Verification email sent again successfully",
            token:user.token
        })
       
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

//Login controller 

export const login = async(req,res)=>{
    try {
        const {email,password}=req.body
        if(!email||!password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const existingUser= await User.findOne({email})
        if(!existingUser){
            return res.status(400).json({
                success:false,
                message:"user not exists"

            })
        }

        const isPasswordValid= await bcrypt.compare(password,existingUser.password)
        if(!isPasswordValid){
            return res.status(400).json({
                success:false,
                message:"Invalied credentials"
            })
        }
        if(!existingUser.isVerified){
            return res.status(400).json({
                success:false,
                message:"verify your account then login"
            })
        }
//genrate  token
const accessToken=jwt.sign({id:existingUser._id},process.env.SECRET_KEY,{expiresIn:"10d"})
const refreshToken=jwt.sign({id:existingUser._id},process.env.SECRET_KEY,{expiresIn:"30d"})

existingUser.isLoggedIn= true
await existingUser.save()

//check for existing session and delete it
const existingSession= await Session.findOne({userId:existingUser._id})
if(existingSession){
    await Session.deleteOne({userId:existingUser._id})
}
//create a new session
await Session.create({userId:existingUser._id})
return res.status(200).json({
    success:true,
    message:`welcome back ${existingUser.firstName}`,
    user:existingUser,
    accessToken,
    refreshToken
})
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
}

//Logout controller

export const logout= async(req,res)=>{

    try {
        const userId= req.id
        await Session.deleteMany({userId:userId})
        await User.findByIdAndUpdate(userId,{isLoggedIn:false})
          return res.status(200).json({
        success:true,
        message:"User logged out successfully"
    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}