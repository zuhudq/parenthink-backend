const admin = require("../config/firebaseConfig");

const verifyToken = async (req, res, next) => {
  // 1. Cek apakah ada token yang dikirim di Header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Akses Ditolak: Token tidak ditemukan." });
  }

  // 2. Ambil tokennya saja (membuang kata "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verifikasi token ke Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 4. Jika valid, simpan data user ke dalam request agar bisa dipakai nanti
    req.user = decodedToken;

    // 5. Izinkan lanjut ke rute yang dituju
    next();
  } catch (error) {
    console.error("Error verifikasi token:", error);
    return res
      .status(403)
      .json({
        message: "Akses Ditolak: Token tidak valid atau sudah kadaluarsa.",
      });
  }
};

module.exports = verifyToken;
