import express from "express";
import {rootHandler} from '../controllers/rootRouteBackController.js';


const router = express.Router();

router.get("/",rootHandler)
export default router