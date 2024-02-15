/*
  Warnings:

  - A unique constraint covering the columns `[Name]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_Name_key" ON "Subcategory"("Name");
