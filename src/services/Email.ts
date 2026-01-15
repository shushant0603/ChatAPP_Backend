import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    // secure: false,
    auth: {     
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendOTPEmail = async (email:string,otp:string)=>{
    await transporter.sendMail({
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
       html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`,
    }); 
};