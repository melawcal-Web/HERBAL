-- Pending / paid / unpaid digital purchase intents + strike counter on users.
ALTER TABLE `users` ADD COLUMN `digital_unpaid_strikes` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `content_acquisitions` ADD COLUMN `purchase_status` VARCHAR(32) NULL;

CREATE INDEX `content_acquisitions_user_id_purchase_status_idx` ON `content_acquisitions`(`user_id`, `purchase_status`);
