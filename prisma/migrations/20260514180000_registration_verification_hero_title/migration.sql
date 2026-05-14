-- Registration persona, therapist verification, certificate link, public hero title line
ALTER TABLE `users` ADD COLUMN `registration_persona` ENUM('therapist', 'student', 'interested') NULL;
ALTER TABLE `users` ADD COLUMN `therapist_verification` ENUM('none', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'none';
ALTER TABLE `users` ADD COLUMN `certificate_url` VARCHAR(512) NULL;

UPDATE `users` u
INNER JOIN `therapist_profiles` p ON p.user_id = u.id
SET u.`therapist_verification` = 'approved', u.`registration_persona` = 'therapist'
WHERE u.`role` = 'therapist';

ALTER TABLE `therapist_profiles` ADD COLUMN `public_therapist_title` VARCHAR(16) NOT NULL DEFAULT 'female';
