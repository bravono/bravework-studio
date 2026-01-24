const {seedUsers} =  require("./dev/users");
const {seedRoles} =  require("./dev/roles");
const {seedProductCategories} =  require("./dev/productCategories");
const {seedConfig} =  require("./prod/config");

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Running production seeds...");
    await seedRoles();
    await seedConfig();
  } else {
    console.log("Running development seeds...");
    await seedUsers();
    await seedProductCategories();
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
