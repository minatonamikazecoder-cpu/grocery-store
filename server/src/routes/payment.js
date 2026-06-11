const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/payment.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware");

router.post("/create-order", verifyJWT, createOrder);

module.exports = router;
