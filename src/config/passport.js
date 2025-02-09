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
  callbackURL:  process.env.CALLBACK_URL,
  proxy: true ,
  passReqToCallback: true
},async (request, accessToken, refreshToken, profile, cb) => {
  try{
    console.log(profile);
    const userEmail = profile.emails[0].value;
    const checkUserExists = await db.query("SELECT * FROM users WHERE email = $1 OR google_id = $2", [userEmail,profile.id]);
    if(checkUserExists.rows.length === 0){
      const newUser = await db.query(
        "INSERT INTO users (email, is_verified, google_id,auth_provider) VALUES ($1, $2, $3, $4) RETURNING *", 
        [userEmail,  true,  profile.id, "google"]
      );
      return cb(null, newUser.rows[0]);
    } else {
      // Update existing user's verification status
      const updatedUser = await db.query(
        "UPDATE users SET is_verified = $1, google_id = $2, auth_provider = $3 WHERE email = $4 RETURNING *",
        [true, profile.id, "google",userEmail]
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