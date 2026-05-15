-- AlterTable therapist_profiles
ALTER TABLE `therapist_profiles` ADD COLUMN `portfolio_timeline` JSON NULL;

-- CreateTable content_acquisitions
CREATE TABLE `content_acquisitions` (
    `id` VARCHAR(191) NOT NULL,
    `therapist_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `guest_email` VARCHAR(191) NULL,
    `guest_name` VARCHAR(120) NULL,
    `content_kind` ENUM('video', 'podcast', 'article', 'recipe', 'lecture', 'course', 'zoom', 'supervision', 'shelf_product') NOT NULL,
    `content_id` VARCHAR(64) NOT NULL,
    `content_title` VARCHAR(300) NOT NULL,
    `event_type` ENUM('acquisition', 'view') NOT NULL,
    `price_category` ENUM('free', 'member', 'regular') NOT NULL,
    `amount_nis` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `center_commission_nis` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `manual_request_id` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `content_acquisitions_manual_request_id_key`(`manual_request_id`),
    INDEX `content_acquisitions_therapist_id_created_at_idx`(`therapist_id`, `created_at`),
    INDEX `content_acquisitions_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `content_acquisitions_content_kind_content_id_idx`(`content_kind`, `content_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable manual_access_requests
CREATE TABLE `manual_access_requests` (
    `id` VARCHAR(191) NOT NULL,
    `therapist_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `guest_email` VARCHAR(191) NOT NULL,
    `guest_name` VARCHAR(120) NULL,
    `content_kind` ENUM('video', 'podcast', 'article', 'recipe', 'lecture', 'course', 'zoom', 'supervision', 'shelf_product') NOT NULL,
    `content_id` VARCHAR(64) NOT NULL,
    `content_title` VARCHAR(300) NOT NULL,
    `price_category` ENUM('free', 'member', 'regular') NOT NULL,
    `amount_nis` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `payment_note` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `manual_access_requests_therapist_id_status_idx`(`therapist_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `content_acquisitions` ADD CONSTRAINT `content_acquisitions_therapist_id_fkey` FOREIGN KEY (`therapist_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `content_acquisitions` ADD CONSTRAINT `content_acquisitions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `content_acquisitions` ADD CONSTRAINT `content_acquisitions_manual_request_id_fkey` FOREIGN KEY (`manual_request_id`) REFERENCES `manual_access_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `manual_access_requests` ADD CONSTRAINT `manual_access_requests_therapist_id_fkey` FOREIGN KEY (`therapist_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `manual_access_requests` ADD CONSTRAINT `manual_access_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend ProductType enum (MySQL: alter enum)
ALTER TABLE `products` MODIFY `type` ENUM('zoom', 'workshop', 'supervision', 'shelf_product', 'video', 'podcast', 'recipe', 'lecture') NOT NULL;
