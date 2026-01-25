import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedRoles() {
  const roles = [
    { role_name: "admin" },
    { role_name: "client" },
    { role_name: "user" },
    { role_name: "instructor" },
    { role_name: "student" },
    { role_name: "freelancer" },
    { role_name: "contributor" },
    { role_name: "guest" },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { role_name: role.role_name },
      update: {},
      create: role,
    });
  }

  await prisma.$disconnect();
}
