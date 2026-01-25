import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedUserRoles() {
  const userRoles = [
    { role_id: 2, user_id: 2 },
  ];

  for (const role of userRoles) {
    await prisma.user_roles.upsert({
      where: { role_id_user_id: { role_id: role.role_id, user_id: role.user_id } }, // composite key
      update: {}, // or specify fields to update
      create: role,
    });
  }
}

