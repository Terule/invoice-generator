-- AlterTable
ALTER TABLE `CompanyProfile`
    ADD COLUMN `paymentBeneficiary` VARCHAR(191) NULL,
    ADD COLUMN `paymentBankName` VARCHAR(191) NULL,
    ADD COLUMN `paymentAccountNumber` VARCHAR(191) NULL,
    ADD COLUMN `paymentIban` VARCHAR(191) NULL,
    ADD COLUMN `paymentSwiftBic` VARCHAR(191) NULL,
    ADD COLUMN `paymentPixKey` VARCHAR(191) NULL,
    ADD COLUMN `paymentInstructions` TEXT NULL;
