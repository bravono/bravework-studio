
-- CreateIndex
CREATE UNIQUE INDEX "unique_user_category_orders" ON "orders"("user_id", "category_id");

