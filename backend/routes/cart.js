import express from 'express';
import { addToCart, getCartItems, getCartItemCount, deleteCartItem } from '../models/cart.js';

const router = express.Router();

// POST /cart/add - Add book to cart
router.post('/cart/add', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    console.log('Adding book to cart:', { userId, bookId });

    // Add book to cart (increase quantity if already exists)
    await addToCart(userId, bookId);

    // Get updated cart count
    const cartCount = await getCartItemCount(userId);

    return res.json({ success: true, cartCount });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /cart - Render cart page with items
router.get('/cart', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/login');
  }
  try {
    const cartItems = await getCartItems(userId);

    // Calculate total price
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });
    // You might want to pass the cart item count for the badge too
    const cartItemCount = await getCartItemCount(userId);
    res.render('cart', { cartItems, totalPrice, cartItemCount });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Server error');
  }
});

// POST /cart/delete/:id - Delete cart item by ID
router.post('/cart/delete/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const cartItemId = req.params.id;
    await deleteCartItem(userId, cartItemId);

    // After deleting, redirect back to the cart page
    res.redirect('/cart');
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).send('Server error');
  }
});

export default router;
