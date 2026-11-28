-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "invoice_number" VARCHAR(50),
ADD COLUMN     "invoice_pdf_url" VARCHAR(255),
ADD COLUMN     "zoho_invoice_id" VARCHAR(100),
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(12,2);
