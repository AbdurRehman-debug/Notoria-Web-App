import {GoogleGenerativeAI} from "@google/generative-ai";
import env from "dotenv";
import { marked } from "marked";
import {storeNotes,getNotes,getIdNote,updateNoteContent,deleteNotee} from "../utils/note_funcs.js";
import sanitizeHtml from 'sanitize-html';

env.config();
const genAI = new GoogleGenerativeAI(process.env.SECRET_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const getCreateNotesPage = (req, res) => {
  
      res.render("createnotes.ejs");
}
export const generateAIResponse = async(req, res) => {
    
const now = new Date();
    try {
          const prompt = req.body.title + " " + req.body.desc;
          const titleinput = req.body.title || null;
          const description = req.body.desc ||null;
          const result = await model.generateContent([prompt]);

          // Ensure we await the response text
          const aiText =  result.response.text();

          // Convert Markdown to HTML
          const markedHtml = marked.parse(aiText);
    
            const time = new Date() -now
             
          // Render the response
          res.render("createnotes.ejs", {  aiResponse: markedHtml,titleback:titleinput,descback:description,AiResponseTime:time });
    
    
      } catch (error) {
          console.error("Error generating AI response:", error);
          res.status(500).send("Error generating AI response");
      }
}
export const saveNote = async (req, res) => {
    try{
        const title = req.body.title;
        const decsription = req.body.desc;
        const aichat = req.body.Ai || null;
        const userID = req.session.user_id;
        await storeNotes(title,decsription,aichat,userID);
        res.redirect(`/notes/viewnotes`);
      }catch(error){
        console.error("Error saving note:", error);
        res.status(500).send("Error saving note");
      }
}
export const getViewNotes= async (req, res) => {
    const userID = req.session.user_id
     const result = await getNotes(userID) 
    
     
        
        res.render("viewnotes.ejs", { ResultsDB:result });
}
export  const getViewSpecificNote = async (req, res) => {
    const noteID = req.body.idNote
    const userID = req.body.idUser
   const result = await getIdNote(noteID,userID)
  
    

    res.render("single_note.ejs", { oneNote:result });
}
export const updateNotes = async (req,res)=>{
    const {titleUpdated,noteID,userID}=req.body
    const updatedDescription = req.body.descUpdated || null
    const updatedAiResponse = req.body.AiUpdated ||null
    const cleantitle = sanitizeHtml(titleUpdated,{
        allowedTags:[]
    });
    const cleanDesc = sanitizeHtml(updatedDescription,{
        allowedTags:[]
    });
    await updateNoteContent(cleantitle,cleanDesc,updatedAiResponse,noteID,userID);
    res.redirect(`/notes/viewnotes`);
}

export const deleteNote = async (req,res) => {
    const noteid = req.body.idNote
    const userid = req.body.idUser
    await deleteNotee(noteid,userid);
    res.redirect(`/notes/viewnotes`);
}

export const logout = async(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        delete req.session.user_id
        delete req.session.theme
        res.redirect('/');
      });
}