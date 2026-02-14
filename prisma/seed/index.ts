import { seedUserRoles } from "./dev/user_roles";
import { seedUsers } from "./dev/users";
import { seedRoles } from "./dev/roles";
import { seedProductCategories } from "./dev/productCategories";
import { seedCourses } from "./dev/courses";
import { seedConfig } from "./prod/config";
import { seedInstructors } from "./dev/instructors";
import { seedCourseCategories } from "./shared/courseCategories";
import { seedTags } from "./shared/tags";
import { prisma } from "./client";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Running production seeds...");
    // Shared seeds (run in both environments)
    await seedCourseCategories();
    await seedTags();
    // Order: roles must be seeded before config (foreign key dependency)
    await seedRoles();
    await seedConfig();
  } else {
    console.log("Running development seeds...");
    // Shared seeds (run in both environments)
    await seedCourseCategories();
    await seedTags();
    // Order: users and roles must exist before user_roles (foreign key dependencies)
    await seedUsers();
    await seedInstructors(); // Must exist before courses
    await seedProductCategories();
    await seedRoles();
    await seedCourses(); // Courses depend on users (instructor_id)
    await seedUserRoles();
  }
}

main()
  .then(() => {
    console.log("Seeding finished.");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
