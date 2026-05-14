-- מפתח יציב לפריטי קטלוג מה-seed (עדכון חוזר בלי למחוק הכל)
ALTER TABLE `products` ADD COLUMN `catalog_key` VARCHAR(64) NULL;
CREATE UNIQUE INDEX `products_catalog_key_key` ON `products` (`catalog_key`);
