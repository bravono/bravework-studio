import { prisma } from "../client";

export async function seedUserRoles() {
  const user = await prisma.users.findUnique({
    where: { email: "ahbideeny@gmail.com" },
  });
  const role = await prisma.roles.findUnique({
    where: { role_name: "admin" },
  });

  if (!user || !role) {
    console.warn("Skipping user_roles seed: user or role not found");
    return;
  }

  await prisma.user_roles.upsert({
    where: {
      role_id_user_id: { role_id: role.role_id, user_id: user.user_id },
    },
    update: {},
    create: { role_id: role.role_id, user_id: user.user_id },
  });
}
