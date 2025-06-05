import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306, 
  user: process.env.DB_USER || 'your_mysql_user',
  password: process.env.DB_PASS || 'your_mysql_password',
  database: process.env.DB_NAME || 'online_bookstore',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
