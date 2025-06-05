import db from '../config/db.js';

export async function getAllUsers() {
   const sql = 'SELECT id, username, email FROM users where is_admin=0 ORDER BY id';
   const [rows] = await db.query(sql);
   return rows;
}

export async function getAllBooks() {
  const [rows] = await db.query('SELECT * FROM books');
  return rows;
}

export async function addBook(book) {
  const { title, author, price, image_url, description } = book;
  await db.query(
    'INSERT INTO books (title, author, price, image_url, description) VALUES (?, ?, ?, ?, ?)',
    [title, author, price, image_url, description]
  );
}

export async function getAllOrders() {
  const [rows] = await db.query(
    `SELECT o.id, u.username, o.status, o.total, o.created_at
     FROM orders o
     JOIN users u ON o.user_id = u.id`
  );
  return rows;
}

export async function markOrderDelivered(orderId) {
  await db.query('UPDATE orders SET status = \'delivered\' WHERE id = ?', [orderId]);
}

export async function getDashboardStats() {
  const [[{ userCount }]] = await db.query('SELECT COUNT(*) AS userCount FROM users');
  const [[{ bookCount }]] = await db.query('SELECT COUNT(*) AS bookCount FROM books');
  const [[{ orderCount }]] = await db.query('SELECT COUNT(*) AS orderCount FROM orders');
  const [[{ totalRevenue }]] = await db.query('SELECT SUM(total) AS totalRevenue FROM orders WHERE status = \'delivered\'');
  return { userCount, bookCount, orderCount, totalRevenue };
}
export async function validateAdminCredentials(username, password) {
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123$';

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
export async function deleteUserById(userId) {
  const sql = 'DELETE FROM users WHERE id = ?';
  const [result] = await pool.query(sql, [userId]);
  return result;
}
export async function deleteBookById(bookId) {
  const query = 'DELETE FROM books WHERE id = ?';
  try {
    const [result] = await db.execute(query, [bookId]);
    return result;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}