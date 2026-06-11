const express = require("express");
const router = express.Router();
const responseController = require("../controllers/response.controller");
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");

router.post("/", responseController.createResponse);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.get("/", responseController.getAllResponses);
router.get("/:id", responseController.getResponseById);
router.put("/:id/reply", responseController.updateReply);
router.delete("/:id", responseController.deleteResponse);

module.exports = router;
