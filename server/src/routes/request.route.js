const express = require("express");
const { authenticateToken, authorizeRole } = require("../middlewares/middleware");
const { getRequestList, createRequest, deleteRequest } = require("../controllers/request.controller");

const router = express.Router();

router.get("/", authenticateToken, authorizeRole("user"), getRequestList);
router.post("/", authenticateToken, authorizeRole("user"), createRequest);
router.delete("/:id", authenticateToken, authorizeRole("user"), deleteRequest);

module.exports = router;