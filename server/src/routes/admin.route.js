const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/middleware.js");
const { adminDashboard } = require("../controllers/admin.controller.js");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("admin"),
  adminDashboard,
);

module.exports = router;
