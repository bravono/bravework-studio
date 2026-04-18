-- Drop the old category-based constraint
DROP INDEX IF EXISTS "unique_user_category_orders";

-- Create the new title-based constraint
CREATE UNIQUE INDEX "unique_user_title_orders" ON "orders"("user_id", "title");
