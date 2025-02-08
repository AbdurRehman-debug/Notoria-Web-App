import env from "dotenv";
env.config();

export const sessionConfig = {
    secret: process.env.MY_TOP_SECRET,
    resave: false,          // Changed to false
    saveUninitialized: true, // Changed to true for OAuth flow
    cookie: { 
        httpOnly: true,
        secure: true,       // Always true since Render uses HTTPS
        sameSite: 'none',   // Changed to 'none' for cross-site OAuth
        maxAge: 24 * 60 * 60 * 1000
    },
    name: 'sessionId',
    proxy: true
}