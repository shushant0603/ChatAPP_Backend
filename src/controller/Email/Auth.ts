import type { Request, Response } from 'express';
import { generateOTP } from '../../utilis/OtpGenerator';
import { sendOTPEmail } from '../../services/Email';
import prisma from "../../lib/prisma"



export const sendOTPController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 1️⃣ Check user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // 2️⃣ Check already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // 3️⃣ Generate OTP
    const otp = generateOTP();

    // 4️⃣ OTP expiry (5 min)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // 5️⃣ Save OTP in DB
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    });

    // 6️⃣ Send OTP email
    await sendOTPEmail(email, otp);

    // 7️⃣ Response
    return res.json({
      success: true,
      message: `OTP has been sent to ${email}`,
    });
  } catch (error) {
    console.error("Error in sendOTPController:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};



export const verifyOTPController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // 1️⃣ basic validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 2️⃣ find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ already verified?
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // 4️⃣ OTP match?
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 5️⃣ OTP expired?
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 6️⃣ verify user
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    // 7️⃣ response
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("verifyOTPController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};
