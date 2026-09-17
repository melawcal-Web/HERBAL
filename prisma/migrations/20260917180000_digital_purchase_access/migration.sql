-- Buyer phone + unguessable access token for digital-product purchases.
ALTER TABLE `content_acquisitions` ADD COLUMN `guest_phone` VARCHAR(64) NULL;
ALTER TABLE `content_acquisitions` ADD COLUMN `access_token` VARCHAR(64) NULL;

CREATE UNIQUE INDEX `content_acquisitions_access_token_key` ON `content_acquisitions`(`access_token`);
