import { Request, Response } from "express";
import prisma from "../lib/prisma"
import { sendOTPEmail } from "../services/Email";
// import { generateOTP } from "../utils/otpGenerator";
import bcrypt from "bcrypt";
import {generateToken }from '../utilis/token';

// apna prisma client path

export const register = async (req: Request, res: Response) => {
  try {
    let { name, email, password } = req.body;

    // 1️⃣ basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ normalize email (VERY IMPORTANT)
    email = email.toLowerCase().trim();

    // 3️⃣ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ create user (DB decides uniqueness)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (error: any) {
    // 🔥 UNIQUE EMAIL ERROR
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};


export const login = async (req: Request, res: Response) => {

try{
  const {email,password}=req.body;

  if(!email || !password){
    return res.status(400).json({
      success:false,
      message:"Email and Password are required",
    });
  }

  const user= await prisma.user.findUnique({
    where:{email},
  });
   // ❗ user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }


 

  if(!user.isVerified){
    return res.status(403).json({
      success:false,
      message:"Email not verified. Please verify your email.",
    });
  }
     // 4️⃣ password match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }


 // 🔐 JWT generate
    const token = generateToken(user.id);
  

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  

}catch(error){
  console.error(error);
  return res.status(500).json({
    success:false,
    message:"Login failed",
  });

};
};
export const logout = async (req: Request, res: Response) => {};
export const me = async (req: Request, res: Response) => {};

export const sendOtp = async (req: Request, res: Response) => {};
export const verifyOtp = async (req: Request, res: Response) => {};

export const forgotPassword = async (req: Request, res: Response) => {};
export const resetPassword = async (req: Request, res: Response) => {};

export const googleAuth = async (req: Request, res: Response) => {};
export const googleCallback = async (req: Request, res: Response) => {};
