const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/middleware.js");
const { adminDashboard, getUserById, getAccountsList, createAccount, editAccount, deleteAccount, resetAccountPassword } = require("../controllers/admin.controller.js");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("admin"),
  adminDashboard,
);

router.get(
  "/user",
  authenticateToken,
  authorizeRole("admin"),
  getAccountsList,
);
router.get('/user/:id', authenticateToken, authorizeRole('admin'), getUserById);
router.post("/user", authenticateToken, authorizeRole('admin'), createAccount);
router.patch("/user/:id", authenticateToken, authorizeRole('admin'), editAccount);
router.delete("/user/:id", authenticateToken, authorizeRole('admin'), deleteAccount);
router.patch("/user/:id/reset-password", authenticateToken, authorizeRole('admin'), resetAccountPassword);

module.exports = router;
