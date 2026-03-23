import { prisma } from "../client";
import * as XLSX from "xlsx";
import path from "path";
import * as fs from "fs";

export async function seedJobApplications() {
  console.log("Seeding job applications...");
  const filePath = path.join(
    process.cwd(),
    "public/assets/Job_Applications.csv.xlsx",
  );

  try {
    // Read file as buffer to avoid fs issues within XLSX
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    console.log(`Found ${data.length} records in ${filePath}`);

    // Fetch the pending status ID dynamically
    const pendingStatus = await prisma.job_app_statuses.findFirst({
      where: { status_name: "Pending" },
    });
    const defaultStatusId = pendingStatus?.status_id || 1;

    for (const app of data) {
      const mappedData = {
        role: app.role || "N/A",
        first_name: app.first_name || "N/A",
        last_name: app.last_name || "N/A",
        email: app.email || "N/A",
        phone: app.phone ? String(app.phone) : null,
        portfolio: app.portfolio || null,
        experience: app.experience || "N/A",
        availability: app.availability || "Immediate",
        cover_letter: app.cover_letter || null,
        created_at: app.created_at ? new Date(app.created_at) : new Date(),
        updated_at: new Date(),
        status_id: app.status_id || defaultStatusId,
      };

      try {
        await prisma.job_applications.create({
          data: mappedData,
        });
      } catch (err) {
        console.error("Failed to seed record:", mappedData);
        throw err;
      }
    }

    console.log("Job applications seeding completed.");
  } catch (error) {
    console.error("Error seeding job applications:", error);
    if (
      error instanceof Error &&
      error.message.includes("Cannot find module 'xlsx'")
    ) {
      console.warn(
        "TIP: Please run 'npm install' to install the 'xlsx' library added to your package.json.",
      );
    }
  }
}
