// src/controllers/authController.js
import bcrypt from 'bcrypt';
import db  from '../models/db.js';
import { generateOTP, sendVerificationEmail } from '../utils/auth.js';
import passport from 'passport';
import env from "dotenv";

env.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);  
//login page
export const getLoginPage = (req, res) => {
    const theme = req.session.theme || "light";
    const message = req.session.message || null;
    req.session.message = null;
    const user_needs_verify = req.session.need_to_otp_verify || null;
    req.session.need_to_otp_verify = null;
    res.render("login.ejs", {
        selectedTheme: theme,
        verification: message,
        need_otp_verify: user_needs_verify
    });
};

export const login = (req, res, next) => {
   
      
      passport.authenticate("local", async (err, user, info) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          req.session.message = info.message;
          return res.redirect("/auth/loginpage");
        }
        
        try {
          const result = await db.query(
            "SELECT is_verified FROM users WHERE email = $1",
            [user.email]
          );
          
          if (!result.rows[0].is_verified) {
            req.session.need_to_otp_verify = true;
            return res.redirect("/auth/loginpage");
          }
          
          req.login(user, (loginErr) => {
            if (loginErr) {
              console.log(loginErr);
              return res.redirect("/auth/loginpage");
            }
            req.session.user_id = user.id;
            res.redirect("/notes/homepage");
          });
          
        } catch(err) {
          console.log(err);
          req.session.message = "An error occurred during login";
          res.redirect("/loginpage");
        }
      })(req, res, next);
};

// Add other controller functions...
//register page
export const getRegisterPage = (req, res) => {
      res.render("register.ejs")
}
export const register = async (req, res) => {
    const username = req.body.username
      const password = req.body.password
      try{
    const checkUserExist = await db.query("SELECT * FROM users WHERE email =$1",[username])
    if(checkUserExist.rows.length >0){
      res.send("User already exist, try logging in with any of the available methods")
    }else{
      const hashedPassword = await bcrypt.hash(password, saltRounds);
          
      // Generate OTP
      const { otp, hashedOTP } = await generateOTP();
      
      // Insert user with OTP
      const result = await db.query(
        "INSERT INTO users(email, password, otp_hash, otp_created_at) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
        [username, hashedPassword, hashedOTP]
      );
      await sendVerificationEmail(username, otp);
       // Store user ID in session for verification
       req.session.pendingUserId = result.rows[0].id;
          req.session.email = username;
          req.session.user_id = result.rows[0].id;
          
       res.redirect("/auth/verify-email")
    }
      }catch(err){
        console.log(err);
      }
}
export const getVerifyEmail = (req, res) => {
    if (!req.session.pendingUserId) {
        return res.redirect("/auth/loginpage");
      }
      const useremail = req.session.email||null;
      delete req.session.email;
      const theme = req.session.theme || "light";
      res.render("verify-email.ejs", { selectedTheme: theme, useremail: useremail });
}
export const verifyOTP = async (req, res) => {
    const { otp } = req.body;
      const userId = req.session.pendingUserId;
    
      if (!userId) {
        return res.redirect("/auth/loginpage");
      }
    
      try {
        const result = await db.query(
          "SELECT * FROM users WHERE id = $1 AND otp_created_at > NOW() - INTERVAL '10 minutes'",
          [userId]
        );
    
        if (result.rows.length === 0) {
          req.session.message = "Verification code expired. Please request a new one.";
          return res.redirect("/auth/loginpage");
        }
    
        const user = result.rows[0];
        const isValidOTP = await bcrypt.compare(otp, user.otp_hash);
    
        if (!isValidOTP) {
          req.session.message = "Invalid verification code. Please try again.";
          return res.redirect("/auth/loginpage");
        }
    
        await db.query(
          "UPDATE users SET is_verified = TRUE, otp_hash = NULL WHERE id = $1",
          [userId]
        );
        delete req.session.pendingUserId;
      const currentTheme = req.session.theme || "light";
        req.login(user, (err) => {
          if (err) {
            console.log(err);
            req.session.theme = currentTheme;
            return res.redirect("/auth/loginpage");
          }
          req.session.user_id = user.id;
          req.session.theme = currentTheme;
          res.redirect("/notes/homepage");
        });
    
      } catch (err) {
        console.log(err);
        res.send("Error verifying OTP");
        res.redirect("/auth/verify_mistake");
      }
}
export const getVerifyMistake = (req, res) => {
    if(!req.session.pendingUserId){
        return res.redirect("/auth/loginpage");
      }
      const theme = req.session.theme || "light";
      res.render("verify_mistake.ejs", { selectedTheme: theme });
}
export const resendVerification = async (req, res) => {
    const {username} = req.body;
      
      try {
        const user = await db.query("SELECT * FROM users WHERE email = $1 AND is_verified = FALSE", [username]);
        
        if (user.rows.length > 0) {
          const { otp, hashedOTP } = await generateOTP();
          await db.query(
            "UPDATE users SET otp_hash = $1, otp_created_at = CURRENT_TIMESTAMP WHERE email = $2",
            [hashedOTP, username]
          );
          await sendVerificationEmail(username, otp);
          req.session.pendingUserId = user.rows[0].id;
          res.redirect("/auth/verify-email");
        } else {
          req.session.message = "User not found or already verified";
          res.redirect("/auth/loginpage");
        }
      } catch (err) {
        console.log(err);
        req.session.message = "Error sending verification email";
        res.redirect("/auth/loginpage");
      }
}
export const forgotPassword = (req,res)=>{
  res.render("forgot.ejs")
}
export const sendCodeForForgotten= async (req,res)=>{
  const {username} = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1 ", [username]);
    
    if (user.rows.length > 0) {
      const { otp, hashedOTP } = await generateOTP();
      await db.query(
        "UPDATE users SET otp_hash = $1, otp_created_at = CURRENT_TIMESTAMP WHERE email = $2",
        [hashedOTP, username]
      );
      await sendVerificationEmail(username, otp);
      req.session.pendingUserIdForgotten = user.rows[0].id;
      res.render("otp_verify_forgotten.ejs",{useremail:username});
    } else {
      req.session.message = "User not found";
      res.redirect("/auth/loginpage");
    }
  } catch (err) {
    console.log(err);
    req.session.message = "Error sending verification email";
    res.redirect("/auth/loginpage");
  }

}
export const verifyOTPForForgotten= async(req,res)=>{
    const {otp} = req.body;
    const userId = req.session.pendingUserIdForgotten;
    
    if (!userId) {
      return res.redirect("/auth/loginpage");
    }
  
    try {
      const result = await db.query(
        "SELECT * FROM users WHERE id = $1 AND otp_created_at > NOW() - INTERVAL '10 minutes'",
        [userId]
      );
  
      if (result.rows.length === 0) {
        req.session.message = "Verification code expired. Please request a new one.";
        return res.redirect("/auth/loginpage");
      }
  
      const user = result.rows[0];
      const isValidOTP = await bcrypt.compare(otp, user.otp_hash);
  
      if (!isValidOTP) {
        req.session.message = "Invalid verification code. Please try again.";
        return res.redirect("/auth/loginpage");
      }
  
      await db.query(
        "UPDATE users SET otp_hash = NULL WHERE id = $1",
        [userId]
      );
      res.redirect("/auth/setNewPassword");
      
  
    } catch (err) {
      console.log(err);
      res.send("Error verifying OTP");
      res.redirect("/auth/verify_mistake");
    }
}
export const NewPassword = (req, res) => {
  if(!req.session.pendingUserIdForgotten){
    return res.redirect("/auth/loginpage");
  }
  res.render("newPassword.ejs")
}
export const saveNewPassword = async (req, res) => {
  try{
    const {password} = req.body;
    const userId = req.session.pendingUserIdForgotten;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
   await  db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);
   delete req.session.pendingUserIdForgotten
   res.send("Password changed successfully");
    res.redirect("/auth/loginpage");
  }catch(err){  
    console.log(err);
  }

}