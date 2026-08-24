-- CreateTable
CREATE TABLE "wifi_vouchers" (
    "voucher_id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "source_type" VARCHAR(50) NOT NULL,
    "user_id" INTEGER,
    "email" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "mac_address" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    "activated_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "order_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wifi_vouchers_pkey" PRIMARY KEY ("voucher_id")
);

-- CreateTable
CREATE TABLE "wifi_sessions" (
    "session_id" SERIAL NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "mac_address" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(50),
    "device_info" VARCHAR(255),
    "duration_minutes" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "bytes_in" BIGINT DEFAULT 0,
    "bytes_out" BIGINT DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wifi_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "hub_lead_profiles" (
    "lead_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "interest_segment" VARCHAR(50) NOT NULL DEFAULT 'ACADEMY_STUDENT',
    "contact_verified" BOOLEAN NOT NULL DEFAULT false,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT true,
    "consent_timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "app_downloaded" BOOLEAN NOT NULL DEFAULT false,
    "web_lead_claimed" BOOLEAN NOT NULL DEFAULT false,
    "welcome_claimed" BOOLEAN NOT NULL DEFAULT false,
    "contact_bonus_claimed" BOOLEAN NOT NULL DEFAULT false,
    "total_spend_kobo" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hub_lead_profiles_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "hub_snack_items" (
    "item_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "price_kobo" INTEGER NOT NULL,
    "image_url" VARCHAR(255),
    "wifi_minutes_reward" INTEGER NOT NULL DEFAULT 30,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hub_snack_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "hub_orders" (
    "hub_order_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "guest_name" VARCHAR(100),
    "guest_phone" VARCHAR(50),
    "total_amount_kobo" INTEGER NOT NULL,
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'PAID',
    "payment_reference" VARCHAR(100),
    "wifi_minutes_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hub_orders_pkey" PRIMARY KEY ("hub_order_id")
);

-- CreateTable
CREATE TABLE "hub_order_items" (
    "order_item_id" SERIAL NOT NULL,
    "hub_order_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_kobo" INTEGER NOT NULL,

    CONSTRAINT "hub_order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wifi_vouchers_code_key" ON "wifi_vouchers"("code");

-- CreateIndex
CREATE INDEX "wifi_vouchers_code_idx" ON "wifi_vouchers"("code");

-- CreateIndex
CREATE INDEX "wifi_vouchers_mac_address_idx" ON "wifi_vouchers"("mac_address");

-- CreateIndex
CREATE INDEX "wifi_vouchers_email_idx" ON "wifi_vouchers"("email");

-- CreateIndex
CREATE INDEX "wifi_vouchers_user_id_idx" ON "wifi_vouchers"("user_id");

-- CreateIndex
CREATE INDEX "wifi_vouchers_status_idx" ON "wifi_vouchers"("status");

-- CreateIndex
CREATE INDEX "wifi_sessions_mac_address_idx" ON "wifi_sessions"("mac_address");

-- CreateIndex
CREATE INDEX "wifi_sessions_status_idx" ON "wifi_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hub_lead_profiles_user_id_key" ON "hub_lead_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hub_lead_profiles_email_key" ON "hub_lead_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hub_lead_profiles_phone_number_key" ON "hub_lead_profiles"("phone_number");

-- CreateIndex
CREATE INDEX "hub_lead_profiles_email_idx" ON "hub_lead_profiles"("email");

-- CreateIndex
CREATE INDEX "hub_lead_profiles_phone_number_idx" ON "hub_lead_profiles"("phone_number");

-- CreateIndex
CREATE INDEX "hub_lead_profiles_interest_segment_idx" ON "hub_lead_profiles"("interest_segment");

-- AddForeignKey
ALTER TABLE "wifi_vouchers" ADD CONSTRAINT "wifi_vouchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wifi_vouchers" ADD CONSTRAINT "wifi_vouchers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "hub_orders"("hub_order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wifi_sessions" ADD CONSTRAINT "wifi_sessions_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "wifi_vouchers"("voucher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_lead_profiles" ADD CONSTRAINT "hub_lead_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_orders" ADD CONSTRAINT "hub_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_order_items" ADD CONSTRAINT "hub_order_items_hub_order_id_fkey" FOREIGN KEY ("hub_order_id") REFERENCES "hub_orders"("hub_order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_order_items" ADD CONSTRAINT "hub_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "hub_snack_items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;
