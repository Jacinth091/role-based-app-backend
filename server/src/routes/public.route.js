const express = require("express");
const { guestContent, getAccountList } = require("../controllers/public.controller.js");

const router = express.Router();

router.get("/guest", guestContent);
router.get("/accounts", getAccountList);

module.exports = router;
