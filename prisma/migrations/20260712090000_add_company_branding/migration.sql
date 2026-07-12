-- AlterTable
ALTER TABLE `CompanyProfile`
    ADD COLUMN `logoData` LONGTEXT NULL,
    ADD COLUMN `invoiceColor` VARCHAR(7) NOT NULL DEFAULT '#0b6281';
