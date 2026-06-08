const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ==========================================
// 1. MIDDLEWARE GLOBAL
// ==========================================
app.use(cors());
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
const frontendDistPath = path.join(__dirname, "../../parenthink-frontend/dist");

// Serve frontend statis
app.use(express.static(frontendDistPath));

// Tangkap semua rute selain "/api" dan arahkan ke index.html milik React
// WAJIB ditaruh di urutan paling bawah dari semua routing!
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// ==========================================
// 4. MENJALANKAN SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
