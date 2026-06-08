const prisma = require("../config/prisma");

// Fungsi pembantu untuk membatasi waktu dari jam 00:00 sampai 23:59 hari ini
const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// 1. Ambil Tracker HARI INI saja
const getTodayTracker = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.uid;

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    const { start, end } = getTodayBounds();

    // Cari data yang HANYA dibuat hari ini
    const tracker = await prisma.dailyTracker.findFirst({
      where: {
        childId: childId,
        createdAt: { gte: start, lte: end },
      },
    });

    if (!tracker) {
      // Jika belum ada catatan hari ini, kembalikan angka 0 (Otomatis Reset!)
      return res.status(200).json({
        sleepHours: 0,
        sleepMins: 0,
        foodKcal: 0,
        drinkMl: 0,
        pottyCount: 0,
      });
    }

    res.status(200).json(tracker);
  } catch (error) {
    console.error("Error get tracker:", error);
    res.status(500).json({ error: "Gagal mengambil data tracker." });
  }
};

// 2. Simpan atau Update Tracker HARI INI
const updateTracker = async (req, res) => {
  try {
    const { childId } = req.params;
    const { sleepHours, sleepMins, foodKcal, drinkMl, pottyCount } = req.body;
    const userId = req.user.uid;

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    const { start, end } = getTodayBounds();

    // Cek apakah hari ini sudah ada catatan?
    const todayTracker = await prisma.dailyTracker.findFirst({
      where: {
        childId: childId,
        createdAt: { gte: start, lte: end },
      },
    });

    let updatedData;
    if (todayTracker) {
      // Jika hari ini sudah ada, kita update baris yang sama
      updatedData = await prisma.dailyTracker.update({
        where: { id: todayTracker.id },
        data: { sleepHours, sleepMins, foodKcal, drinkMl, pottyCount },
      });
    } else {
      // Jika hari ini belum ada, kita buat baris KERTAS BARU untuk hari ini
      updatedData = await prisma.dailyTracker.create({
        data: { childId, sleepHours, sleepMins, foodKcal, drinkMl, pottyCount },
      });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error update tracker:", error);
    res.status(500).json({ error: "Gagal menyimpan data tracker." });
  }
};

// 3. (FITUR BARU) Ambil Data Tracker 7 Hari Terakhir untuk Grafik
const getWeeklyTracker = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.uid;

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.userId !== userId)
      return res.status(403).json({ error: "Akses ditolak." });

    // Hitung tanggal 7 hari yang lalu
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 6 hari lalu + hari ini = 7 hari
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Ambil semua data dari 7 hari lalu sampai sekarang
    const trackers = await prisma.dailyTracker.findMany({
      where: {
        childId: childId,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "asc" },
    });

    // Rancang array 7 hari untuk Recharts (walaupun ada hari yang bolong tidak diisi)
    const daysIndo = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0]; // Format YYYY-MM-DD
      const dayName = daysIndo[d.getDay()];

      // Cari apakah ada data di tanggal tersebut
      const trackerDay = trackers.find(
        (t) => t.createdAt.toISOString().split("T")[0] === dateString,
      );

      // Hitung total jam (contoh: 7 jam 30 menit = 7.5 jam)
      const sleepTotal = trackerDay
        ? trackerDay.sleepHours + trackerDay.sleepMins / 60
        : 0;

      weeklyData.push({
        day: dayName,
        sleep: parseFloat(sleepTotal.toFixed(1)), // Bulatkan ke 1 angka di belakang koma
      });
    }

    res.status(200).json(weeklyData);
  } catch (error) {
    console.error("Error get weekly tracker:", error);
    res.status(500).json({ error: "Gagal mengambil data mingguan." });
  }
};

module.exports = { getTodayTracker, updateTracker, getWeeklyTracker };
