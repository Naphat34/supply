-- AlterTable
ALTER TABLE `materials` ADD COLUMN `location_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `materials` ADD CONSTRAINT `materials_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;
