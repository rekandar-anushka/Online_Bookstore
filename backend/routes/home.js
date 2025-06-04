router.get('/', async (req, res) => {
  try {
    const [books] = await pool.query('SELECT * FROM books');
    res.render('home', {
      books,
      cartCount: req.session.cartCount || 0,
      isAdmin: req.session.isAdmin === true
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
