import env from "dotenv"
import pg from "pg";

env.config();

const db = new pg.Pool({
    connectionString: process.env.DB_URL,
    ssl: {
      require: true
    }
  });
  
 export default db;
 async function dbConnection() {
    try {
        await db.query("SELECT 1");
        console.log("Connected to the database");
    } catch (err) {
        console.log(err);
    }
}
dbConnection();