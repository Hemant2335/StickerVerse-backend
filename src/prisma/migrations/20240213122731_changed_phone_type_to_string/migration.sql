/*
  Warnings:

  - A unique constraint covering the columns `[Name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "Phone" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_Name_key" ON "Category"("Name");
