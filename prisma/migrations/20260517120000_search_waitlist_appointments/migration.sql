-- Product ownership, waitlist, tags, audience
ALTER TABLE `products` ADD COLUMN `therapist_id` VARCHAR(191) NULL;
ALTER TABLE `products` ADD COLUMN `tags` JSON NULL;
ALTER TABLE `products` ADD COLUMN `min_participants` INT NOT NULL DEFAULT 5;
ALTER TABLE `products` ADD COLUMN `current_registered` INT NOT NULL DEFAULT 0;
ALTER TABLE `products` ADD COLUMN `is_waitlist` BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX `products_therapist_id_idx` ON `products`(`therapist_id`);

-- Articles: tags + target audience
ALTER TABLE `herbal_articles` ADD COLUMN `tags` JSON NULL;
ALTER TABLE `herbal_articles` ADD COLUMN `audience` JSON NULL;

-- Therapist weekly availability (JSON) + appointment requests
ALTER TABLE `therapist_profiles` ADD COLUMN `weekly_availability` JSON NULL;

CREATE TABLE `appointment_requests` (
    `id` VARCHAR(191) NOT NULL,
    `therapist_id` VARCHAR(191) NOT NULL,
    `client_user_id` VARCHAR(191) NULL,
    `guest_name` VARCHAR(191) NOT NULL,
    `guest_email` VARCHAR(191) NOT NULL,
    `guest_phone` VARCHAR(191) NULL,
    `slot_start` DATETIME(3) NOT NULL,
    `slot_end` DATETIME(3) NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `appointment_requests_therapist_id_slot_start_idx`(`therapist_id`, `slot_start`),
    INDEX `appointment_requests_client_user_id_idx`(`client_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `waitlist_entries` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `guest_email` VARCHAR(191) NOT NULL,
    `guest_name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE INDEX `waitlist_entries_product_id_guest_email_key`(`product_id`, `guest_email`),
    INDEX `waitlist_entries_product_id_idx`(`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
