-- CreateTable
CREATE TABLE "LongevityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "answersJson" TEXT NOT NULL,
    "trainingScore" INTEGER NOT NULL,
    "nutritionScore" INTEGER NOT NULL,
    "sleepScore" INTEGER NOT NULL,
    "stressScore" INTEGER NOT NULL,
    "preventionScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LongevityAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LongevityAssessment_userId_idx" ON "LongevityAssessment"("userId");
