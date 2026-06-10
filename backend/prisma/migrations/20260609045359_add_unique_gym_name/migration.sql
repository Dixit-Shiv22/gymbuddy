/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Gym_name_key" ON "Gym"("name");
