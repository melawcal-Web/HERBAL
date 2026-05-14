-- MySQL: content metadata, article category, therapist supervision flags
ALTER TABLE `herbal_articles` ADD COLUMN `category` VARCHAR(128) NULL;
ALTER TABLE `products` ADD COLUMN `metadata` JSON NULL;
ALTER TABLE `therapist_profiles` ADD COLUMN `accepts_supervision_requests` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `therapist_profiles` ADD COLUMN `supervision_hourly_rate` DECIMAL(10, 2) NULL;
