-- AlterTable
ALTER TABLE "users" ADD COLUMN     "id_card_back_url" VARCHAR(255),
ADD COLUMN     "id_card_front_url" VARCHAR(255),
ADD COLUMN     "id_type" VARCHAR(50),
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selfie_with_id_url" VARCHAR(255),
ADD COLUMN     "verification_submitted_at" TIMESTAMPTZ(6);
