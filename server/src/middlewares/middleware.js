const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required!",
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid or expired token!" });
    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        error: "Access denied: Insufficient permissions.",
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
