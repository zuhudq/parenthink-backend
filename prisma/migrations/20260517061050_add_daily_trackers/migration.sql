-- CreateTable
CREATE TABLE "DailyTracker" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sleepHours" INTEGER NOT NULL DEFAULT 0,
    "sleepMins" INTEGER NOT NULL DEFAULT 0,
    "foodKcal" INTEGER NOT NULL DEFAULT 0,
    "drinkMl" INTEGER NOT NULL DEFAULT 0,
    "pottyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTracker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyTracker" ADD CONSTRAINT "DailyTracker_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
