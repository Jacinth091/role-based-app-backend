const express = require("express");
const { guestContent } = require("../controllers/public.controller.js");

const router = express.Router();

router.get("/guest", guestContent);

module.exports = router;
