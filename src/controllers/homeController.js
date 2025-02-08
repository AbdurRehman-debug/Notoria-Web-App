
import {getNumberofTotalNotess} from "../utils/note_funcs.js"
export const homeHandler = async (req, res) => {
    const user= req.session.user_id
    const result = await getNumberofTotalNotess(user);
    const length = result[0].count
    res.render("homepage.ejs",{count:length});
}
