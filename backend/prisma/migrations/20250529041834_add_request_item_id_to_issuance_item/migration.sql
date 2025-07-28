/*
  Warnings:

  - Added the required column `request_item_id` to the `issuance_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `issuance_items` ADD COLUMN `request_item_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `issuance_items` ADD CONSTRAINT `issuance_items_request_item_id_fkey` FOREIGN KEY (`request_item_id`) REFERENCES `request_items`(`request_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
