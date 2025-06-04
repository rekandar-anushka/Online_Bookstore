// backend/models/book.js
import pool from '../config/db.js';

export async function getAllBooks() {
  const [rows] = await pool.query('SELECT * FROM books');
  return rows;
}
