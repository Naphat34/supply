-- CreateTable
CREATE TABLE `materials` (
    `material_id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_code` VARCHAR(50) NOT NULL,
    `material_name_th` VARCHAR(255) NOT NULL,
    `material_name_en` VARCHAR(255) NULL,
    `unit` VARCHAR(50) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `reorder_point` INTEGER NULL,
    `safety_stock` INTEGER NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `materials_material_code_key`(`material_code`),
    PRIMARY KEY (`material_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `categories_category_name_key`(`category_name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_items` (
    `request_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `requested_quantity` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`request_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requests` (
    `request_id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_number` VARCHAR(20) NOT NULL,
    `requester_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,
    `request_date` DATE NOT NULL,
    `request_reason` TEXT NOT NULL,
    `approval_status` ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ไม่อนุมัติ') NOT NULL,
    `approved_by` INTEGER NULL,
    `approved_date` DATETIME(3) NULL,
    `approval_reason` TEXT NULL,
    `processing_status` ENUM('รอจ่าย', 'กำลังดำเนินการ', 'เบิกจ่ายแล้ว') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `requests_request_number_key`(`request_number`),
    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `issuances` (
    `issuance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` INTEGER NOT NULL,
    `issuance_number` VARCHAR(20) NOT NULL,
    `issued_by` INTEGER NOT NULL,
    `issued_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` TEXT NULL,

    UNIQUE INDEX `issuances_request_id_key`(`request_id`),
    UNIQUE INDEX `issuances_issuance_number_key`(`issuance_number`),
    PRIMARY KEY (`issuance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `issuance_items` (
    `issuance_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `issuance_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `issued_quantity` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`issuance_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_transactions` (
    `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `transaction_type` ENUM('เข้า', 'ออก') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference_id` INTEGER NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_levels` (
    `stock_level_id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `last_updated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_levels_material_id_location_id_key`(`material_id`, `location_id`),
    PRIMARY KEY (`stock_level_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `phone_number` VARCHAR(20) NULL,
    `department_id` INTEGER NOT NULL,
    `role` ENUM('admin', 'staff', 'approver') NOT NULL DEFAULT 'staff',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `department_id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `departments_department_name_key`(`department_name`),
    PRIMARY KEY (`department_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `location_id` INTEGER NOT NULL AUTO_INCREMENT,
    `location_name` VARCHAR(100) NOT NULL,
    `location_type` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locations_location_name_key`(`location_name`),
    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `materials` ADD CONSTRAINT `materials_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_items` ADD CONSTRAINT `request_items_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`request_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_items` ADD CONSTRAINT `request_items_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requests` ADD CONSTRAINT `requests_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requests` ADD CONSTRAINT `requests_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requests` ADD CONSTRAINT `requests_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `issuances` ADD CONSTRAINT `issuances_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`request_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `issuances` ADD CONSTRAINT `issuances_issued_by_fkey` FOREIGN KEY (`issued_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `issuance_items` ADD CONSTRAINT `issuance_items_issuance_id_fkey` FOREIGN KEY (`issuance_id`) REFERENCES `issuances`(`issuance_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `issuance_items` ADD CONSTRAINT `issuance_items_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transactions` ADD CONSTRAINT `stock_transactions_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transactions` ADD CONSTRAINT `stock_transactions_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_levels` ADD CONSTRAINT `stock_levels_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_levels` ADD CONSTRAINT `stock_levels_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
