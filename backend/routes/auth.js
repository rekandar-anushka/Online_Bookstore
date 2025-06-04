import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js'; // Your MySQL pool connection

const router = express.Router();

// GET login page
router.get('/login', (req, res) => {

  res.render('login');
});

// GET register page
router.get('/register', (req, res) => {
  res.render('register');
});

// POST register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, street, city, state, zipcode } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).send('Username or email already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query(
      'INSERT INTO users (username, email, password, street, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, street, city, state, zipcode]
    );

    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).send('Invalid username or password');
    }

    const user = rows[0];
    console.log(user);
    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send('Invalid username or password');
    }

    // Save user ID in session
    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin == 1 ? true : false;
    // Redirect to home page
    console.log(user.is_admin);
    if(user.is_admin) {
      console.log('redirect to dashoard');
      res.redirect('/admin/dashboard')
    }
    else{
        res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

export default router;
