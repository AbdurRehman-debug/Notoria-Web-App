import env from "dotenv";
env.config();

export const sessionConfig = {
    secret: process.env.MY_TOP_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || process.env.CALLBACK_URL?.includes('https'),
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    },
    name: 'sessionId',
    proxy: true  // Add this line to trust the proxy
}