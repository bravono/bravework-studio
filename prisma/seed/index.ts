import { seedUserRoles } from "./dev/user_roles";
import { seedUsers } from "./dev/users";
import { seedRoles } from "./dev/roles";
import { seedProductCategories } from "./dev/productCategories";
import { seedCourses } from "./dev/courses";
import { seedConfig } from "./prod/config";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Running production seeds...");
    await seedRoles();
    await seedConfig();
  } else {
    console.log("Running development seeds...");
    await seedUsers();
    await seedProductCategories();
    await seedRoles();
    await seedUserRoles();
  }
}

main()
  .then(() => {
    console.log("Seeding finished.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
