import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedRoles() {
  const roles = [{ role_name: "contributor" }];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: {role_name: role.role_name},
      update: {},
      create: role,
    });
  }
}
