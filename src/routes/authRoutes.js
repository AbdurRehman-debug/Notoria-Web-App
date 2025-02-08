import express from 'express';
import * as authController from '../controllers/authController.js';
import { rateLimit } from '../middleware/auth.js';
import passport from 'passport';
const router = express.Router();

router.get('/loginpage', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/registerpage', authController.getRegisterPage);
router.post('/register',  rateLimit, authController.register);
router.get('/verify-email', authController.getVerifyEmail);
router.post('/verify-otp', authController.verifyOTP);
router.get('/verify_mistake', authController.getVerifyMistake);
router.post('/resend_verification', rateLimit,authController.resendVerification);
router.get("/login/google", 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get("/google/notoria",(req,res,next)=>{
    passport.authenticate("google", async (err, user, info) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.redirect("/auth/loginpage");
        }
        
        try {
          
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
}
    
    );
 router.get("/forgot",authController.forgotPassword);
 router.post("/resend_code_forgot",rateLimit,authController.sendCodeForForgotten);
 router.post("/verify-otp-forgotten",authController.verifyOTPForForgotten);
 router.get("/setNewPassword",authController.NewPassword);
 router.post("/saveNewPassword",authController.saveNewPassword);
export default router;