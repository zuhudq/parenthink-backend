const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");

// Import SEMUA fungsi controller di dalam satu kurung kurawal
const {
  getChildren,
  createChild,
  updateChild,
  deleteChild,
  updateVitals,
} = require("../controllers/childController");

const router = express.Router();

// Rute CRUD Utama
router.get("/", verifyToken, getChildren);
router.post("/", verifyToken, createChild);
router.put("/:id", verifyToken, updateChild);
router.delete("/:id", verifyToken, deleteChild);

// Rute Update Vitals (Fisik)
router.put("/:id/vitals", verifyToken, updateVitals);

module.exports = router;
