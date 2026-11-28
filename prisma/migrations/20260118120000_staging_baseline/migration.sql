-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "budget_ranges" (
    "budget_range_id" SERIAL NOT NULL,
    "range_value" VARCHAR,
    "product_category_id" SMALLINT
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "challenges" (
    "challenge_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("challenge_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "coupons" (
    "coupon_id" SERIAL NOT NULL,
    "coupon_code" VARCHAR(45) NOT NULL,
    "discount_amount" DECIMAL(5,2) NOT NULL,
    "created_date" TIMESTAMP(6) NOT NULL,
    "expiration_date" TIMESTAMP(6) NOT NULL,
    "usage_limit" INTEGER NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("coupon_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "course_categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "course_enrollments" (
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "preferred_session_id" INTEGER NOT NULL,
    "enrolment_id" SERIAL NOT NULL,
    "payment_status" INTEGER DEFAULT 3,
    "enrollment_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("enrolment_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "course_tags" (
    "course_tag_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "course_tags_pkey" PRIMARY KEY ("course_tag_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "course_tools" (
    "course_tool_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "tool_id" INTEGER NOT NULL,

    CONSTRAINT "course_tools_pkey" PRIMARY KEY ("course_tool_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "courses" (
    "course_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT false,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "instructor_id" INTEGER,
    "max_students" INTEGER,
    "price_in_kobo" INTEGER DEFAULT 0,
    "thumbnail_url" TEXT,
    "course_category_id" INTEGER,
    "level" VARCHAR(50),
    "language" VARCHAR(50),
    "tag_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "early_bird_discount" INTEGER,
    "discount_start_date" DATE,
    "discount_end_date" DATE,
    "slug" VARCHAR(255),
    "content" TEXT,
    "excerpt" TEXT,
    "age_bracket" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "custom_offer_statuses" (
    "offer_status_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "custom_offer_statuses_pkey" PRIMARY KEY ("offer_status_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "custom_offers" (
    "offer_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "offer_amount_in_kobo" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6) DEFAULT (now() + '48:00:00'::interval),
    "rejection_reason" TEXT,
    "project_duration_days" INTEGER,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_offers_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "instructors" (
    "instructor_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "email" VARCHAR(255),

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("instructor_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "invoices" (
    "invoice_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(5,2) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "due_date" DATE,
    "payment_status_id" SMALLINT,
    "user_id" INTEGER,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_app_app_files" (
    "job_application_id" INTEGER NOT NULL,
    "application_file_id" INTEGER NOT NULL,

    CONSTRAINT "application_application_files_pkey" PRIMARY KEY ("job_application_id","application_file_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_app_statuses" (
    "status_id" SERIAL NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "job_app_statuses_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_application_files" (
    "application_file_id" SERIAL NOT NULL,
    "file_name" VARCHAR(255),
    "file_size" VARCHAR(45),
    "file_url" TEXT,
    "job_application_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT '2025-07-06 07:22:45.360158+00'::timestamp with time zone,

    CONSTRAINT "application_files_pkey" PRIMARY KEY ("application_file_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_applications" (
    "job_application_id" SERIAL NOT NULL,
    "role" VARCHAR(45),
    "first_name" VARCHAR(45),
    "last_name" VARCHAR(45),
    "email" VARCHAR(255),
    "phone" VARCHAR(45),
    "portfolio" VARCHAR(255),
    "experience" VARCHAR(45),
    "availability" VARCHAR(45),
    "cover_letter" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT '2025-06-27 14:18:28.071445+00'::timestamp with time zone,
    "updated_at" TIMESTAMPTZ(6) DEFAULT '2025-06-27 14:18:28.40919+00'::timestamp with time zone,
    "status_id" INTEGER,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("job_application_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "link" VARCHAR(255),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_coupons" (
    "order_id" INTEGER NOT NULL,
    "coupon_id" INTEGER NOT NULL,

    CONSTRAINT "order_coupons_pkey" PRIMARY KEY ("order_id","coupon_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_files" (
    "order_file_id" SERIAL NOT NULL,
    "file_name" VARCHAR(255),
    "file_size" VARCHAR(45),
    "file_url" TEXT NOT NULL,
    "order_id" SMALLINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT '2025-07-06 07:30:35.152621+00'::timestamp with time zone,

    CONSTRAINT "order_files_pkey" PRIMARY KEY ("order_file_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_order_files" (
    "order_id" INTEGER NOT NULL,
    "order_file_id" INTEGER NOT NULL,

    CONSTRAINT "order_order_files_pkey" PRIMARY KEY ("order_id","order_file_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "orders" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "project_description" TEXT,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "thumbnail" VARCHAR(255),
    "payment_status_id" INTEGER,
    "budget_range" VARCHAR(45),
    "timeline" VARCHAR(45),
    "total_expected_amount_kobo" INTEGER NOT NULL DEFAULT 0,
    "amount_paid_to_date_kobo" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_portfolio" BOOLEAN DEFAULT false,
    "tracking_id" VARCHAR(100),
    "offer_id" INTEGER,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payment_statuses" (
    "payment_status_id" SERIAL NOT NULL,
    "name" VARCHAR(45),

    CONSTRAINT "payment_statuses_pkey" PRIMARY KEY ("payment_status_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payments" (
    "payment_id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "paystack_reference" VARCHAR(255) NOT NULL,
    "amount_kobo" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "paystack_status" VARCHAR(45) NOT NULL,
    "gateway_response" TEXT,
    "customer_email" VARCHAR(255) NOT NULL,
    "is_fraudulent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT '2025-06-20 07:45:26.581799+00'::timestamp with time zone,
    "updated_at" TIMESTAMP(6) DEFAULT '2025-06-20 07:45:26.581799'::timestamp without time zone,
    "payment_option_selected" VARCHAR(50),
    "discount_applied_percentage" DECIMAL(5,2),
    "rental_booking_id" INTEGER,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_budget_ranges" (
    "product_budget_range_id" SERIAL NOT NULL,
    "project_category_id" SMALLINT,
    "budget_range_id" SMALLINT,

    CONSTRAINT "product_budget_ranges_pkey" PRIMARY KEY ("product_budget_range_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(45) NOT NULL,
    "category_description" VARCHAR(255),
    "accepted_files" VARCHAR(255),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_orders" (
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "product_orders_pkey" PRIMARY KEY ("order_id","product_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "products" (
    "product_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(45) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "price" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_owner" (
    "userid" INTEGER NOT NULL,
    "projectid" INTEGER NOT NULL,

    CONSTRAINT "project_owner_pkey" PRIMARY KEY ("userid","projectid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_status" (
    "project_status_id" SERIAL NOT NULL,
    "status" VARCHAR(45) NOT NULL,

    CONSTRAINT "project_status_pkey" PRIMARY KEY ("project_status_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_status_status" (
    "project_id" INTEGER NOT NULL,
    "project_status_id" INTEGER NOT NULL,

    CONSTRAINT "project_status_status_pkey" PRIMARY KEY ("project_id","project_status_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_tools" (
    "project_id" INTEGER NOT NULL,
    "tool_id" INTEGER NOT NULL,

    CONSTRAINT "project_tools_pkey" PRIMARY KEY ("project_id","tool_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "referral_earnings" (
    "referral_earning_id" SERIAL NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "referred_user_id" INTEGER NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "order_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_used" BOOLEAN DEFAULT false,

    CONSTRAINT "referral_earnings_pkey" PRIMARY KEY ("referral_earning_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "rental_earnings" (
    "rental_earning_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "booking_id" INTEGER,
    "amount_kobo" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_earnings_pkey" PRIMARY KEY ("rental_earning_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "rental_images" (
    "image_id" SERIAL NOT NULL,
    "rental_id" INTEGER,
    "image_name" VARCHAR(255),
    "image_size" VARCHAR(45),
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "rentals" (
    "rental_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_type" VARCHAR(50) NOT NULL,
    "device_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "specs" TEXT,
    "hourly_rate" INTEGER NOT NULL,
    "location_city" VARCHAR(100) NOT NULL,
    "location_address" VARCHAR(255),
    "location_lat" DECIMAL(10,8),
    "location_lng" DECIMAL(11,8),
    "has_internet" BOOLEAN DEFAULT false,
    "has_backup_power" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "approval_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("rental_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(45) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "secure_tokens" (
    "token" TEXT NOT NULL,
    "offer_id" INTEGER,
    "action" TEXT,
    "expires_at" TIMESTAMPTZ(6),
    "used" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,
    "id" SERIAL NOT NULL,

    CONSTRAINT "secure_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sessions" (
    "session_id" SERIAL NOT NULL,
    "course_id" INTEGER,
    "session_number" INTEGER NOT NULL,
    "session_link" TEXT,
    "session_timestamp" TIMESTAMPTZ(6),
    "hour_per_session" SMALLINT,
    "recording_link" TEXT,
    "session_label" VARCHAR(45),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "solutions" (
    "solution_id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("solution_id","challenge_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tags" (
    "tag_id" SERIAL NOT NULL,
    "tag_name" VARCHAR(100),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "testimonials" (
    "testimonial_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" VARCHAR(255),
    "date" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("testimonial_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "timelines" (
    "timeline_id" INTEGER NOT NULL,
    "timeline_value" VARCHAR,
    "timeline_label" VARCHAR,
    "product_category_id" SMALLINT
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "todos" (
    "todo_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "titile" VARCHAR(255) NOT NULL,
    "status" VARCHAR(45) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("todo_id","project_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tools" (
    "tool_id" SERIAL NOT NULL,
    "name" VARCHAR(45) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("tool_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_coupons" (
    "user_id" INTEGER,
    "coupon_id" INTEGER,
    "user_coupon_id" SERIAL NOT NULL,

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("user_coupon_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_roles" (
    "user_role_id" SERIAL NOT NULL,
    "role_id" INTEGER,
    "user_id" INTEGER,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(45) NOT NULL,
    "last_name" VARCHAR(45) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT,
    "bio" VARCHAR(255),
    "profile_picture_url" VARCHAR(255),
    "company_name" VARCHAR(255),
    "phone" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT '2025-06-20 08:11:26.304144+00'::timestamp with time zone,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT '2025-06-20 08:12:14.117883+00'::timestamp with time zone,
    "last_verification_email_sent_at" TIMESTAMPTZ(6),
    "email_verified" TIMESTAMPTZ(6),
    "referral_code" VARCHAR(255),
    "referred_by_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'email_verification',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "wallet_usages" (
    "wallet_usage_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "amount_kobo" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "rental_booking_id" INTEGER,

    CONSTRAINT "wallet_usages_pkey" PRIMARY KEY ("wallet_usage_id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_challenges_projects1_idx" ON "challenges"("project_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_course_enrollment_users1_idx" ON "course_enrollments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_course_enrollment" ON "course_enrollments"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "course_tags_course_id_tag_id_key" ON "course_tags"("course_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "course_tools_course_id_tool_id_key" ON "course_tools"("course_id", "tool_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "instructors_email_key" ON "instructors"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_invoices_orders1_idx" ON "invoices"("order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_ordercoupons_coupon1_idx" ON "order_coupons"("coupon_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_orderorderfiles_orderfiles1_idx" ON "order_order_files"("order_file_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_projects_admins_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_projects_category1_idx" ON "orders"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "orders_user_category_idx" ON "orders"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payments_paystack_reference_key" ON "payments"("paystack_reference");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "category_name_unique" ON "product_categories"("category_name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_ordercoupons_orders1_idx" ON "product_orders"("order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_productorders_products1_idx" ON "product_orders"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "name_unique" ON "products"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_products_category1_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_projectowner_projects1_idx" ON "project_owner"("projectid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_project_status_status_project_status1_idx" ON "project_status_status"("project_status_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_project_tools_tools1_idx" ON "project_tools"("tool_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_projecttools_projects1_idx" ON "project_tools"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "role_name_unique" ON "roles"("role_name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_challenges_copy1_challenges1_idx" ON "solutions"("challenge_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fk_todos_projects1_idx" ON "todos"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_role" ON "user_roles"("role_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_product_category') THEN
        ALTER TABLE "budget_ranges" ADD CONSTRAINT "constraint_product_category" FOREIGN KEY ("product_category_id") REFERENCES "product_categories"("category_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_challenges_projects1') THEN
        ALTER TABLE "challenges" ADD CONSTRAINT "fk_challenges_projects1" FOREIGN KEY ("project_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_course_enrollment_courses1') THEN
        ALTER TABLE "course_enrollments" ADD CONSTRAINT "fk_course_enrollment_courses1" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_course_enrollment_users1') THEN
        ALTER TABLE "course_enrollments" ADD CONSTRAINT "fk_course_enrollment_users1" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_preferred_session') THEN
        ALTER TABLE "course_enrollments" ADD CONSTRAINT "fk_preferred_session" FOREIGN KEY ("preferred_session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_tags_course_id_fkey') THEN
        ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_tags_tag_id_fkey') THEN
        ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_tools_course_id_fkey') THEN
        ALTER TABLE "course_tools" ADD CONSTRAINT "course_tools_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_tools_tool_id_fkey') THEN
        ALTER TABLE "course_tools" ADD CONSTRAINT "course_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("tool_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_course_instructor') THEN
        ALTER TABLE "courses" ADD CONSTRAINT "fk_course_instructor" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("instructor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_offer_status') THEN
        ALTER TABLE "custom_offers" ADD CONSTRAINT "fk_offer_status" FOREIGN KEY ("status_id") REFERENCES "custom_offer_statuses"("offer_status_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_id') THEN
        ALTER TABLE "custom_offers" ADD CONSTRAINT "fk_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_id') THEN
        ALTER TABLE "custom_offers" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_status') THEN
        ALTER TABLE "invoices" ADD CONSTRAINT "fk_payment_status" FOREIGN KEY ("payment_status_id") REFERENCES "payment_statuses"("payment_status_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user') THEN
        ALTER TABLE "invoices" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'application_application_files_application_file_id_fkey') THEN
        ALTER TABLE "job_app_app_files" ADD CONSTRAINT "application_application_files_application_file_id_fkey" FOREIGN KEY ("application_file_id") REFERENCES "job_application_files"("application_file_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'application_application_files_application_id_fkey') THEN
        ALTER TABLE "job_app_app_files" ADD CONSTRAINT "application_application_files_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("job_application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_1') THEN
        ALTER TABLE "job_application_files" ADD CONSTRAINT "constraint_1" FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("job_application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_status_id') THEN
        ALTER TABLE "job_applications" ADD CONSTRAINT "fk_status_id" FOREIGN KEY ("status_id") REFERENCES "job_app_statuses"("status_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ordercoupons_coupon1') THEN
        ALTER TABLE "order_coupons" ADD CONSTRAINT "fk_ordercoupons_coupon1" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_2') THEN
        ALTER TABLE "order_files" ADD CONSTRAINT "constraint_2" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orderorderfiles_orderfiles1') THEN
        ALTER TABLE "order_order_files" ADD CONSTRAINT "fk_orderorderfiles_orderfiles1" FOREIGN KEY ("order_file_id") REFERENCES "order_files"("order_file_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_offer') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "fk_offer" FOREIGN KEY ("offer_id") REFERENCES "custom_offers"("offer_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_product_category1') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "fk_product_category1" FOREIGN KEY ("category_id") REFERENCES "product_categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_projects_admins') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "fk_projects_admins" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_1') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "constraint_1" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_1') THEN
        ALTER TABLE "product_budget_ranges" ADD CONSTRAINT "constraint_1" FOREIGN KEY ("project_category_id") REFERENCES "product_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_productorders_products1') THEN
        ALTER TABLE "product_orders" ADD CONSTRAINT "fk_productorders_products1" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_category1') THEN
        ALTER TABLE "products" ADD CONSTRAINT "fk_products_category1" FOREIGN KEY ("category_id") REFERENCES "product_categories"("category_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_owner_projects1') THEN
        ALTER TABLE "project_owner" ADD CONSTRAINT "fk_project_owner_projects1" FOREIGN KEY ("projectid") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_owner_users1') THEN
        ALTER TABLE "project_owner" ADD CONSTRAINT "fk_project_owner_users1" FOREIGN KEY ("userid") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_status_status_project_status1') THEN
        ALTER TABLE "project_status_status" ADD CONSTRAINT "fk_project_status_status_project_status1" FOREIGN KEY ("project_status_id") REFERENCES "project_status"("project_status_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_status_status_projects1') THEN
        ALTER TABLE "project_status_status" ADD CONSTRAINT "fk_project_status_status_projects1" FOREIGN KEY ("project_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_tools_tools1') THEN
        ALTER TABLE "project_tools" ADD CONSTRAINT "fk_project_tools_tools1" FOREIGN KEY ("tool_id") REFERENCES "tools"("tool_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_projecttools_projects1') THEN
        ALTER TABLE "project_tools" ADD CONSTRAINT "fk_projecttools_projects1" FOREIGN KEY ("project_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referral_earnings_order_id_fkey') THEN
        ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referral_earnings_referred_user_id_fkey') THEN
        ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referral_earnings_referrer_id_fkey') THEN
        ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_course_id_fkey') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_challenges_copy1_challenges1') THEN
        ALTER TABLE "solutions" ADD CONSTRAINT "fk_challenges_copy1_challenges1" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("challenge_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roles_users100') THEN
        ALTER TABLE "testimonials" ADD CONSTRAINT "fk_roles_users100" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_todos_projects1') THEN
        ALTER TABLE "todos" ADD CONSTRAINT "fk_todos_projects1" FOREIGN KEY ("project_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_coupon_id') THEN
        ALTER TABLE "user_coupons" ADD CONSTRAINT "constraint_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_user_id') THEN
        ALTER TABLE "user_coupons" ADD CONSTRAINT "constraint_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_role_id_fkey') THEN
        ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey') THEN
        ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_referred_by_id_fkey') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'verification_tokens_user_id_fkey') THEN
        ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallet_usages_order_id_fkey') THEN
        ALTER TABLE "wallet_usages" ADD CONSTRAINT "wallet_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallet_usages_user_id_fkey') THEN
        ALTER TABLE "wallet_usages" ADD CONSTRAINT "wallet_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;
