import db from "../models/db.js"

export const storeNotes = async (title,decsription,aichat,userID)=>{
    try{
        await db.query("INSERT INTO notes(title,description,ai_response,user_id) VALUES($1,$2,$3,$4)",[title,decsription,aichat,userID])
      }catch(error){
        console.log(error);
      }
}
export const getNotes = async (userID)=>{
    try{
        const result = await db.query("SELECT * FROM notes WHERE user_id = $1", [userID]);
        return result.rows
      }catch(error){
        console.log(error);
      }
}
export const getIdNote = async (noteid,userid)=>{
try{
  const result = await db.query("SELECT *FROM notes WHERE id = $1 AND user_id = $2", [noteid,userid]);
  return result.rows;
}catch(error){
  console.log(error);
  }
}
export const updateNoteContent = async (updatedTitle,updatedDescription,updatedAiResponse,noteid,userid)=>{
  try{
    await db.query("UPDATE notes SET title = $1,description=$2,ai_response=$3 WHERE id=$4 AND user_id =$5",[updatedTitle,updatedDescription,updatedAiResponse,noteid,userid])
  }catch(error){
    console.log(error);
  }
}
export const deleteNotee =async (noteid,userid)=>{
  try{
    await db.query("DELETE FROM notes WHERE id=$1 AND user_id =$2",[noteid,userid])
  }catch(error){
    console.log(error);
  }
}
export const getNumberofTotalNotess = async (userid)=>{
  try{
    const result = await db.query("SELECT COUNT(*) FROM notes WHERE user_id = $1", [userid]);
   return result.rows
  }catch(error){
    console.log(error);
  }
}