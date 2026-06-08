const admin = require("firebase-admin");

// 1. Tentukan sumber kredensial (Local JSON file atau Environment Variable)
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Jika di Vercel, ambil dari Environment Variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Gagal melakukan parsing JSON dari FIREBASE_SERVICE_ACCOUNT:", error);
    process.exit(1); // Berhenti jika format JSON salah
  }
} else {
  // Jika di laptop, ambil dari file lokal
  try {
    serviceAccount = require("../../serviceAccountKey.json");
  } catch (error) {
    console.error("Gagal memuat serviceAccountKey.json. Pastikan file ada di path yang benar.");
    process.exit(1);
  }
}

// 2. Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
