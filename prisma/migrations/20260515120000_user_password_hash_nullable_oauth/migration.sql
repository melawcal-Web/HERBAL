-- AlterTable: allow OAuth-only users without a local password hash
ALTER TABLE `users` MODIFY `passwordHash` VARCHAR(191) NULL;
