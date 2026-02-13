import { PrismaClient } from "@prisma/client";

export async function seedUserRoles() {
  const prisma = new PrismaClient();
  const userRoles = [{ role_id: 1, user_id: 1 }];

  for (const role of userRoles) {
    await prisma.user_roles.upsert({
      where: {
        role_id_user_id: { role_id: role.role_id, user_id: role.user_id },
      }, // composite key
      update: {}, // or specify fields to update
      create: role,
    });
  }
  await prisma.$disconnect();
}
