import express from "express";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import env from "dotenv";
import { sessionConfig } from './src/config/session.js';
import { setupPassport } from './src/config/passport.js';
import authRoutes from "./src/routes/authRoutes.js";
import noteRoutes from './src/routes/notesRoutes.js';
import homepage from './src/routes/homeRoute.js';
import rootRoute from './src/routes/rootRouteBack.js';

env.config();

const app = express();
const port = 3000;
app.set('trust proxy', 1);
app.enable('trust proxy');
// Middleware setup
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
setupPassport(passport);
// Routes


app.use("/root",rootRoute)
app.use("/notes",homepage);
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);

// Default route
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/notes/homepage");
    } else {
        
        res.render("index.ejs");
    }
});

// Start server

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
