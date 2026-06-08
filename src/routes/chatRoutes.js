const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const { askAI } = require("../controllers/chatController");

const router = express.Router();

// Rute ini juga dijaga ketat oleh satpam Firebase
router.post("/", verifyToken, askAI);

module.exports = router;
