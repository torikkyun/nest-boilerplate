/*
  Warnings:

  - Added the required column `password_hash` to the `staffs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staffs` ADD COLUMN `password_hash` VARCHAR(191) NOT NULL;
