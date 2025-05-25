export function isAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).render('not_logged_in'); 
  }

  if (req.user?.isAdmin) {
    return next(); 
  }

  return res.status(403).render('not_admin'); 
}
