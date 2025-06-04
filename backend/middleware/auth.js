// auth.js (or any filename you prefer)

export function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  } else {
    return res.redirect('/admin/login');
  }
}
