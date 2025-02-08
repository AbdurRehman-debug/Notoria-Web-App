import {Strategy} from "passport-local";
import GoogleStrategy from "passport-google-oauth2"
import bcrypt from "bcrypt";
import db from "../models/db.js"
import env from "dotenv";

env.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);
export const setupPassport=(passport)=>{
passport.use("local",new Strategy(async function verify(username,password,cb){
  try{
    const checkUserExists = await db.query("SELECT * FROM users WHERE email = $1", [username]);
    if (checkUserExists.rows.length > 0) {
      const user = checkUserExists.rows[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return cb(err);
        } else {
          if(result){
          return cb(null, user);
            }else{ 
              
          return cb(null,false,{message:"incorrect password"})

          }
        } 
      });
    } else {
      return cb(null,false,{message:"user not found"}); 
  }}catch(error){
    cb(error)
  }
}))

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  "http://localhost:3000/auth/google/notoria",
  proxy: true ,
  passReqToCallback: true
},async (request, accessToken, refreshToken, profile, cb) => {
  try{
    const userEmail = profile.emails[0].value;
    const userpassword = await bcrypt.hash(process.env.USER_PASSWORD, saltRounds);
    const checkUserExists = await db.query("SELECT * FROM users WHERE email = $1", [userEmail]);
    if(checkUserExists.rows.length === 0){
      const newUser = await db.query(
        "INSERT INTO users (email, password, is_verified) VALUES ($1, $2, $3) RETURNING *", 
        [userEmail, userpassword, true]
      );
      return cb(null, newUser.rows[0]);
    } else {
      // Update existing user's verification status
      const updatedUser = await db.query(
        "UPDATE users SET is_verified = TRUE WHERE email = $1 RETURNING *",
        [userEmail]
      );
      
      return cb(null, updatedUser.rows[0]);
    }
  } catch(error){
    console.error("Google Auth Error:", error);
    return cb(error);
  }
}))

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try{
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    cb(null, user);
  }catch(error){
    cb(error)
  }
});
}