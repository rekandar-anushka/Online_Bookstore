import express from 'express';
import db from '../config/db.js'; // adjust path to your db connection

const router = express.Router();

// Show checkout page (address form + order summary)
router.get('/cart/checkout', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/login');
  }

  try {
    const [cartItems] = await db.query(`
      SELECT ci.book_id, ci.quantity, b.title, b.price
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      WHERE ci.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.render('checkout', { cartItems, totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Handle form submission to place order
router.post('/cart/checkout', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/login');
  }

  const { street, city, state, zipcode } = req.body;

  try {
    const [cartItems] = await db.query(`
      SELECT ci.book_id, ci.quantity, b.price
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      WHERE ci.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Insert order with shipping info
    const [orderResult] = await db.query(`
      INSERT INTO orders (user_id, total, status, created_at, street, city, state, zipcode)
      VALUES (?, ?, 'pending', NOW(), ?, ?, ?, ?)
    `, [userId, totalPrice, street, city, state, zipcode]);

    const orderId = orderResult.insertId;

    const orderItemsValues = cartItems.map(item => [orderId, item.book_id, item.quantity, item.price]);

    await db.query(`
      INSERT INTO order_items (order_id, book_id, quantity, price)
      VALUES ?
    `, [orderItemsValues]);

    // Clear the cart
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    res.redirect('/cart'); // redirect to orders summary or confirmation page
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error while placing order.');
  }
});

export default router;
