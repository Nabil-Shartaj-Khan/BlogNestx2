export function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log("User is not authenticated");
    return res.status(401).json({ error: "User is not authenticated" });
  }
  next();
}
