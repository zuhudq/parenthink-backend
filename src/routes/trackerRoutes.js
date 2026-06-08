const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const {
  getTodayTracker,
  updateTracker,
  getWeeklyTracker,
} = require("../controllers/trackerController");

const router = express.Router();

// PENTING: Rute spesifik (/weekly) harus diletakkan DI ATAS rute dinamis (/:childId)
router.get("/:childId/weekly", verifyToken, getWeeklyTracker); // <-- Jalur baru untuk Grafik
router.get("/:childId", verifyToken, getTodayTracker);
router.post("/:childId", verifyToken, updateTracker);

module.exports = router;
