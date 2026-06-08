const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../config/prisma");

// Inisialisasi Gemini dengan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const askAI = async (req, res) => {
  try {
    const { question, childId } = req.body;
    const userId = req.user.uid;

    // 1. Ambil Data Anak
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Akses ditolak atau anak tidak ditemukan." });
    }

    // 2. Ambil Data Tracker Terakhir (Hari Ini)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const latestTracker = await prisma.dailyTracker.findFirst({
      where: {
        childId: childId,
        createdAt: { gte: start, lte: end },
      },
    });

    // Hitung Usia Anak
    const ageMs = Date.now() - new Date(child.dateOfBirth).getTime();
    const ageDate = new Date(ageMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    const ageString =
      years === 0 ? `${months} bulan` : `${years} tahun ${months} bulan`;

    // 3. Siapkan Teks Tracker untuk dibisikkan ke AI
    let trackerContext =
      "Belum ada catatan aktivitas harian yang diisi hari ini.";
    if (latestTracker) {
      trackerContext = `
      Catatan Harian Hari Ini:
      - Total Tidur: ${latestTracker.sleepHours} jam ${latestTracker.sleepMins} menit
      - Total Kalori Masuk: ${latestTracker.foodKcal} kkal
      - Total Cairan/Minum: ${latestTracker.drinkMl} ml
      - Frekuensi Ganti Popok (BAK/BAB): ${latestTracker.pottyCount} kali
      `;
    }

    // 4. Bikin Prompt Super Lengkap
    const systemPrompt = `
      Kamu adalah "Parenthink AI", asisten parenting virtual yang empatik, ramah, dan profesional. 
      Tugasmu adalah menjawab pertanyaan orang tua berdasarkan profil anak berikut ini. 

      Jika orang tua bertanya tentang evaluasi kondisi, gunakan data fisik dan catatan harian ini untuk menilai apakah sudah sesuai dengan standar kesehatan anak seusianya.

      PROFIL ANAK:
      - Nama: ${child.name}
      - Usia: ${ageString}
      - Jenis Kelamin: ${child.gender || "Tidak disebutkan"}
      - Berat Badan Terkini: ${child.weight} kg
      - Tinggi Badan Terkini: ${child.height} cm
      - Kondisi Medis: ${child.medicalHistory || "Tidak ada"}
      - Alergi: ${child.allergies || "Tidak ada"}
      
      ${trackerContext}

      Gunakan format Markdown untuk merapikan jawaban (gunakan teks tebal, list, dll).
      Pertanyaan dari orang tua: "${question}"
    `;

    // 5. Kirim ke Google Cloud Gemini
    const result = await model.generateContent(systemPrompt);
    const answer = result.response.text();

    // 6. Simpan interaksi ke history database (MENGGUNAKAN SKEMA ASLI)
    await prisma.interactionHistory.create({
      data: {
        userId: userId,
        childId: childId,
        issueCategory: "Umum",
        aiResponse: answer,
      },
    });

    // 7. Langsung kirim jawaban ke web!
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error AI Chat:", error);
    res.status(500).json({ error: "Gagal memproses AI" });
  }
};

module.exports = { askAI };
