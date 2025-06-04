import express from 'express';
import {
  getAllUsers,
  getAllBooks,
  addBook,
  getAllOrders,
  markOrderDelivered,
  getDashboardStats,
  validateAdminCredentials,
  deleteUserById,
  deleteBookById
} from '../models/admin.js';
import { isAdmin } from '../middleware/auth.js';
const router = express.Router();

// Show admin login page
router.get('/login', (req, res) => {
  res.render('login', { error: null, isAdminLogin: true });
});

// Handle admin login form submission
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const isValid = await validateAdminCredentials(username, password);
    if (!isValid) {
      return res.render('login', {
        error: 'Invalid admin credentials',
        isAdminLogin: true
      });
    }

    req.session.userId = 'admin';
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    res.render('login', {
      error: 'Server error, please try again',
      isAdminLogin: true
    });
  }
});

// Admin logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.redirect('/admin/login');
  });
});

// Admin dashboard - protected route
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const [books, users, orders, stats] = await Promise.all([
      getAllBooks(),
      getAllUsers(),
      getAllOrders(),
      getDashboardStats()
    ]);

    res.render('admin/dashboard', { books, users, orders, stats });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Server error');
  }
});

// ------------------- Book Management -------------------

// GET: List all books
router.get('/books', isAdmin, async (req, res) => {
  try {
    const books = await getAllBooks();
    res.render('admin/books', { books });
  } catch (error) {
    console.error('Error loading books:', error);
    res.status(500).send('Server error');
  }
});

// GET: Show add book form
router.get('/books/add', isAdmin, (req, res) => {
  res.render('admin/addBook'); // You should create `addBook.handlebars`
});

// POST: Handle new book submission
router.post('/books', isAdmin, async (req, res) => {
  const { title, author, price, image_url, description } = req.body;

  try {
    await addBook({ title, author, price, image_url, description });
    res.redirect('/admin/books');
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).send('Server error');
  }
});

// ------------------- Order & User Management -------------------

// Mark order as delivered
router.post('/orders/:id/deliver', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await markOrderDelivered(id);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Server error');
  }
});

// Delete user
router.post('/users/:id/delete', isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    await deleteUserById(userId);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Server error');
  }
});
//delete Book by id
router.post('/books/:id/delete', isAdmin, async (req, res) => {
  const bookId = req.params.id;
  try {
    await deleteBookById(bookId); // Ensure this function exists in your DB logic
    res.redirect('/admin/books');
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).send('Server error');
  }
});
export default router;
