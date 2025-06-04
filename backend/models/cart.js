import db from '../config/db.js'; // Your database connection

export async function addToCart(userId, bookId) {
  // Check if book already in cart
  const [existing] = await db.query(
    'SELECT quantity FROM cart_items WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );

  if (existing.length > 0) {
    // Update quantity
    await db.query(
      'UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
  } else {
    // Insert new item with quantity 1
    await db.query(
      'INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, 1)',
      [userId, bookId]
    );
  }
}

export async function getCartItemCount(userId) {
  const [result] = await db.query(
    'SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?',
    [userId]
  );
  return result[0].count || 0;
}

export async function getCartItems(userId) {
  const [rows] = await db.query(
    `SELECT 
        ci.id,         -- Added cart_items.id for delete operations
        ci.quantity, 
        b.id AS book_id,
        b.title, 
        b.author, 
        b.price, 
        b.image_url
     FROM cart_items ci
     JOIN books b ON ci.book_id = b.id
     WHERE ci.user_id = ?`,
    [userId]
  );
  return rows;
}

export async function deleteCartItem(userId, cartItemId) {
  await db.query(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [cartItemId, userId]
  );
}
