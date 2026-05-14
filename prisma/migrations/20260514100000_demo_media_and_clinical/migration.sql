-- AlterTable
ALTER TABLE `therapist_profiles` ADD COLUMN `clinical_experience` TEXT NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `image_url` VARCHAR(512) NULL;

-- AlterTable
ALTER TABLE `herbal_articles` ADD COLUMN `cover_image_url` VARCHAR(512) NULL;
