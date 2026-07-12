-- AlterTable
ALTER TABLE `CompanyProfile`
    DROP COLUMN `logoData`,
    ADD COLUMN `logoPath` VARCHAR(512) NULL;
