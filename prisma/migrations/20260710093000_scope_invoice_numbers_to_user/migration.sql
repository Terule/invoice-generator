-- DropIndex
DROP INDEX `Invoice_invoiceNumber_key` ON `Invoice`;

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_userId_invoiceNumber_key` ON `Invoice`(`userId`, `invoiceNumber`);
