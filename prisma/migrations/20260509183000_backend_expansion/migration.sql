-- CreateTable
CREATE TABLE "AssistantConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" TEXT NOT NULL,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssistantConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AssistantConversation_userId_lastMessageAt_idx" ON "AssistantConversation"("userId", "lastMessageAt");

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Course" ADD COLUMN "isCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "completedAt" DATETIME;
