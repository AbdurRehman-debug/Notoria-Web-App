
import { rateLimit as expressRateLimit } from 'express-rate-limit';

const limiter = expressRateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 300,                  // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {   // Custom response when the limit is hit
      res.status(429).send("Too many requests, please try again after 15 minutes.");
    }
  });


export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {

        return next();
    }

    res.redirect('/auth/loginpage');
};

export const isEmailVerified = async (req, res, next) => {
    if (!req.user) {

        return res.redirect('/auth/loginpage');
    }
    
    if (!req.user.is_verified) {

        req.session.need_to_otp_verify = true;
        return res.redirect('/auth/loginpage');
    }
    
    next();
};
export const rateLimit = (req,res,next)=>{
        limiter(req, res, next);
}