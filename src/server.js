const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ==========================================
// 1. MIDDLEWARE GLOBAL
// ==========================================
// Konfigurasi CORS "Galak" untuk menangani Preflight
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "*"], // Izinkan localhost secara spesifik
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Beberapa browser versi lama bermasalah dengan status 204
  }),
);

// WAJIB: Tangani preflight requests (OPTIONS) secara manual
app.options("*", cors());
app.use(express.json());

// ==========================================
// 2. IMPORT & GUNAKAN ROUTES API
// ==========================================
const userRoutes = require("./routes/userRoutes");
const childRoutes = require("./routes/childRoutes");
const chatRoutes = require("./routes/chatRoutes");
const trackerRoutes = require("./routes/trackerRoutes");

app.use("/api/users", userRoutes);
app.use("/api/children", childRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/trackers", trackerRoutes);

// Test Route (Public)
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Parenthink API is running successfully!" });
});

// ==========================================
// 3. SETTING DEPLOYMENT (FRONTEND SERVING)
// ==========================================
// Karena server.js ada di dalam folder "src", kita harus naik 2 level (../../)
// untuk menemukan folder "parenthink-frontend/dist"
// Rute Utama Backend
app.get("/", (req, res) => {
  res.status(200).send("Selamat datang di API Parenthink!");
});

// ==========================================
// 4. MENJALANKAN SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
