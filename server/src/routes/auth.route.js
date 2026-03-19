const express = require("express");
const {
  login,
  register,
  profile,
  verifyEmail,
} = require("../controllers/auth.controller.js");
const router = express.Router();
const { authenticateToken } = require("../middlewares/middleware.js");

router.post("/login", login);
router.post("/register", register);
router.post("/profile", authenticateToken, profile);
router.post("/verify", verifyEmail);

module.exports = router;
