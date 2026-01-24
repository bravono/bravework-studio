import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedConfig() {
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
}
