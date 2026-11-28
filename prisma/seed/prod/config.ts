import { prisma } from "../client";

export async function seedConfig() {
  // Example: insert baseline roles
  await prisma.roles.upsert({
    where: { role_name: "admin" },
    update: {},
    create: { role_name: "admin" },
  });

  await prisma.roles.upsert({
    where: { role_name: "user" },
    update: {},
    create: { role_name: "user" },
  });
}
