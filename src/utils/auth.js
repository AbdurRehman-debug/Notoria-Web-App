import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import env from "dotenv";

env.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);
 const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const generateOTP=async()=>{
    const otp = crypto.randomInt(1000, 9999).toString().padStart(4, '0');
      const hashedOTP = await bcrypt.hash(otp, saltRounds);
      return { otp, hashedOTP };
}
export const sendVerificationEmail=async (email, otp)=> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  }
  return transporter.sendMail(mailOptions);
};