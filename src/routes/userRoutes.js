const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const prisma = require("../config/prisma"); // Memanggil database kita
const router = express.Router();

router.get("/profile", verifyToken, async (req, res) => {
  try {
    // req.user berisi data dari Google (Firebase) yang lolos satpam
    const { uid, email, name } = req.user;

    // 1. Cek apakah user ini sudah ada di tabel User Supabase kita
    let user = await prisma.user.findUnique({
      where: { id: uid },
    });

    // 2. Kalau belum ada (baru pertama kali login), buatkan data barunya di Supabase!
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uid,
          email: email || "",
          name: name || "Orang Tua Baru",
        },
      });
    }

    // 3. Kembalikan data user ke frontend
    res.status(200).json({
      message: "Berhasil mengambil profil dari Database Parenthink!",
      user: user,
    });
  } catch (error) {
    console.error("Error database:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// Rute untuk meng-update data profil orang tua
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, parentingRole, phoneNumber } = req.body;
    const userId = req.user.uid;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        parentingRole: parentingRole || null,
        phoneNumber: phoneNumber || null,
      },
    });

    res
      .status(200)
      .json({ message: "Profil orang tua diperbarui!", user: updatedUser });
  } catch (error) {
    console.error("Error update user:", error);
    res.status(500).json({ error: "Gagal memperbarui profil orang tua" });
  }
});

module.exports = router;
