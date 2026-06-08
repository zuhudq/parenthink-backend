const admin = require("firebase-admin");

// Nanti kamu harus mengunduh file serviceAccountKey.json dari Firebase Console
// dan meletakkannya di root folder proyek.
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
