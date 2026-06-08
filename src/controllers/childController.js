const prisma = require("../config/prisma");

// 1. Ambil semua data anak milik user yang login
const getChildren = async (req, res) => {
  try {
    const userId = req.user.uid;
    const children = await prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ error: "Gagal mengambil data anak." });
  }
};

// 2. Tambah data anak baru
const createChild = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, dateOfBirth, gender, allergies, interests, medicalHistory } =
      req.body;

    const newChild = await prisma.child.create({
      data: {
        userId,
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        allergies,
        interests,
        medicalHistory,
        weight: 0,
        height: 0,
      },
    });
    res.status(201).json(newChild);
  } catch (error) {
    console.error("Error creating child:", error);
    res.status(500).json({ error: "Gagal menambahkan data anak." });
  }
};

// 3. Update data profil anak
const updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { name, dateOfBirth, gender, allergies, interests, medicalHistory } =
      req.body;

    const existingChild = await prisma.child.findUnique({ where: { id } });
    if (!existingChild || existingChild.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak" });
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        allergies,
        interests,
        medicalHistory,
      },
    });
    res.status(200).json(updatedChild);
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({ error: "Gagal memperbarui data anak." });
  }
};

// 4. Hapus data anak
// 4. Hapus data anak
const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const existingChild = await prisma.child.findUnique({ where: { id } });
    if (!existingChild || existingChild.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak" });
    }

    // SAPU BERSIH DATA TERKAIT TERLEBIH DAHULU (Penting!)
    // 1. Hapus riwayat chat AI milik anak ini
    await prisma.interactionHistory.deleteMany({ where: { childId: id } });

    // 2. Hapus catatan harian (tracker) milik anak ini
    await prisma.dailyTracker.deleteMany({ where: { childId: id } });

    // SETELAH BERSIH, BARU HAPUS DATA INDUKNYA (Anak)
    await prisma.child.delete({ where: { id } });

    res
      .status(200)
      .json({
        message: "Data anak beserta seluruh riwayatnya berhasil dihapus",
      });
  } catch (error) {
    console.error("Error deleting child:", error);
    res.status(500).json({ error: "Gagal menghapus data anak." });
  }
};

// 5. Update data fisik / Vitals (Ini yang baru kita buat)
const updateVitals = async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, height } = req.body;
    const userId = req.user.uid;

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child || child.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,
      },
    });

    res.status(200).json(updatedChild);
  } catch (error) {
    console.error("Error update vitals:", error);
    res.status(500).json({ error: "Gagal memperbarui data fisik anak." });
  }
};

// Ekspor semua fungsi
module.exports = {
  getChildren,
  createChild,
  updateChild,
  deleteChild,
  updateVitals,
};
