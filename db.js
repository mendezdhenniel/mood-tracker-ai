import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // THIS LINE IS CRITICAL

export const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mood_tracker_db",
});