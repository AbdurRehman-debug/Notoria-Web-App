 export const rootHandler = (req,res)=>{
    const theme = req.session.theme || "light";
    res.render("index.ejs",{selectedTheme: theme});
}