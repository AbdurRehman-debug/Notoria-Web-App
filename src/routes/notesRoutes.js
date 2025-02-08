import express from 'express';
import * as noteController from '../controllers/noteController.js';
import { isAuthenticated, isEmailVerified } from '../middleware/auth.js';


const router = express.Router();

router.get('/createnotes', isAuthenticated, isEmailVerified, noteController.getCreateNotesPage);
router.post('/askai', isAuthenticated, isEmailVerified, noteController.generateAIResponse);
router.post('/savenote', isAuthenticated, isEmailVerified, noteController.saveNote);
router.get('/viewnotes', isAuthenticated, isEmailVerified, noteController.getViewNotes);
router.post('/viewnote/:id', isAuthenticated, isEmailVerified, noteController.getViewSpecificNote);
router.post("/editnotes",isAuthenticated,isEmailVerified,noteController.updateNotes)
router.post("/deletenote",isAuthenticated,isEmailVerified,noteController.deleteNote)
router.post("/logout",isAuthenticated,isEmailVerified,noteController.logout)
export default router;