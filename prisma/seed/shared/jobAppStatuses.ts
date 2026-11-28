import { prisma } from "../client";

export async function seedJobAppStatuses() {
  console.log("Seeding job application statuses...");
  const statuses = [
    { status_name: "Pending" },
    { status_name: "Reviewed" },
    { status_name: "Interviewing" },
    { status_name: "Rejected" },
    { status_name: "Hired" },
  ];

  for (const status of statuses) {
    await prisma.job_app_statuses
      .upsert({
        where: { status_id: -1 }, // Use a dummy where condition for name-based logic
        // Since status_name isn't unique in schema (VarChar 50),
        // but logically should be, we'll find by name or create.
        update: {},
        create: status,
      })
      .catch(async () => {
        // Fallback if upsert logic with -1 is awkward for this model
        const exists = await prisma.job_app_statuses.findFirst({
          where: { status_name: status.status_name },
        });
        if (!exists) {
          await prisma.job_app_statuses.create({ data: status });
        }
      });
  }
}
