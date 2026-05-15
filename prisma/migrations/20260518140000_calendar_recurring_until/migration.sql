ALTER TABLE `therapist_profiles` ADD COLUMN `availability_open_until` DATETIME(3) NULL;
ALTER TABLE `appointment_requests` ADD COLUMN `recurring_weekly` BOOLEAN NOT NULL DEFAULT false;
