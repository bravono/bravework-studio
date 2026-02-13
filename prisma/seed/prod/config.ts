import { PrismaClient } from "@prisma/client";

export async function seedConfig() {
  const prisma = new PrismaClient();
  // Example: insert baseline roles
  await prisma.roles.upsert({
    where: { role_name: "Admin" },
    update: {},
    create: { role_name: "Admin" },
  });

  await prisma.roles.upsert({
    where: { role_name: "User" },
    update: {},
    create: { role_name: "User" },
  });
  await prisma.$disconnect();
}
