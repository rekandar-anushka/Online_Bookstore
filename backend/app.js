import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import hbs from 'hbs'; // ✅ Stick with this
import adminRoutes from './routes/admin.js';
import { getAllBooks } from './models/book.js';
import { getCartItemCount } from './models/cart.js';
import cartRoutes from './routes/cart.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
const app = express();
const PORT = process.env.PORT || 3000;

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session middleware
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
}));
// Register custom helpers
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});
hbs.registerHelper('eq', (a, b) => a === b);
// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Set up hbs view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../frontend/views'));

// ✅ Register Handlebars helpers
hbs.registerHelper('multiply', (a, b) => (a * b).toFixed(2));
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

// Static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Middleware to set cart count in views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const count = await getCartItemCount(req.session.userId);
      res.locals.cartItemCount = count;
    } catch (err) {
      console.error('Error fetching cart count:', err);
      res.locals.cartItemCount = 0;
    }
  } else {
    res.locals.cartItemCount = 0;
  }
  next();
});

// Routes
app.use('/admin', adminRoutes);
app.use('/', authRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
// Landing page
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/home');
  }
  res.render('index');
});

// Home page
app.get('/home', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  try {
    const books = await getAllBooks();
    const currentUserCartCount = await getCartItemCount(req.session.userId);
    res.render('home', { books, cartCount: currentUserCartCount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Login/Register
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
