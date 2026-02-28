// db.js
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // Add these two lines to prevent timeouts during the cloud handshake
  connectTimeout: 20000, 
  waitForConnections: true
});