import session from "express-session";
import passport from "passport";
import { sessionConfig } from '../config/session.js';
import { setupPassport } from '../config/passport.js';


export const setupMiddleware = (app) => {
    // Use session config from config folder
    app.use(session(sessionConfig));
    
    // Use passport setup from config folder
    app.use(passport.initialize());
    app.use(passport.session());
    setupPassport(passport)
};
