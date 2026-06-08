const { PrismaClient } = require("@prisma/client");

let prisma;

// Mencegah Prisma membuat koneksi baru setiap kali nodemon restart
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
