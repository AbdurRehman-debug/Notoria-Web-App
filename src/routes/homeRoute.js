import { isAuthenticated, isEmailVerified } from '../middleware/auth.js';
import { homeHandler} from '../controllers/homeController.js';
import express from "express";
const router = express.Router();
 router.get("/homepage",isAuthenticated,isEmailVerified,homeHandler)
export default router

