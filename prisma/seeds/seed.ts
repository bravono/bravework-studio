// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./static/roles";
import { seedProductCategories } from "./static/categories";
import { seedProducts } from "./static/products";
import { seedTools } from "./static/tools";
import { seedCoupons } from "./static/coupons";
const prisma = new PrismaClient();

async function seedStaticData() {
  await seedRoles(prisma);
  await seedProductCategories(prisma);
  await seedProducts(prisma);
  await seedTools(prisma);
  await seedCoupons(prisma);
}

seedStaticData()
  .catch((e) => console.error("Static seeding error:", e))
  .finally(() => prisma.$disconnect());
