type Role = {
  role_Id: number;
  role_name: string;
};

export const ROLES: Role[] = [
  { role_Id: 1, role_name: "ADMIN" },
  { role_Id: 2, role_name: "CUSTOMER" },
  { role_Id: 3, role_name: "FREELANCER" },
  { role_Id: 4, role_name: "AUTHOR" },
  { role_Id: 5, role_name: "STUDENT" },
];

export const seedRoles = async (prisma) => {
  await prisma.roles.createMany({
    data: ROLES,
    skipDuplicates: true, // Critical for static data!
  });
};
