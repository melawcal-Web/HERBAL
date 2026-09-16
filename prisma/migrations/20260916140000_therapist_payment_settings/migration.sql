-- Therapist-chosen P2P payment methods (Bit / PayBox) for product checkout handoff.
ALTER TABLE `therapist_profiles` ADD COLUMN `payment_settings` JSON NULL;
