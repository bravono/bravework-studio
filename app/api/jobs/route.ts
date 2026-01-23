import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Content-Type. Expected multipart/form-data or application/x-www-form-urlencoded",
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();

    // Extract fields
    const role = formData.get("role") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const portfolio = formData.get("portfolio") as string;
    const experience = formData.get("experience") as string;
    const availability = formData.get("availability") as string;
    const message = formData.get("message") as string;

    const fileString = formData.get("file") as string;
    let fileInfo: {
      fileName: string;
      fileSize: string;
      fileUrl: string;
    } | null = null;

    if (fileString) {
      try {
        fileInfo = JSON.parse(fileString);
      } catch (e) {
        console.error("Error parsing file info:", e);
      }
    }

    await withTransaction(async (client: any) => {
      // 1. Insert Job Application
      const insertAppQuery = `
            INSERT INTO job_applications 
            (role, first_name, last_name, email, phone, portfolio, experience, availability, cover_letter, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING job_application_id
        `;
      const appValues = [
        role,
        firstName,
        lastName,
        email,
        phone,
        portfolio,
        experience,
        availability,
        message,
      ];
      const appResult = await client.query(insertAppQuery, appValues);
      const jobApplicationId = appResult.rows[0].job_application_id;

      // 2. Insert File (if exists)
      if (fileInfo && fileInfo.fileUrl) {
        const insertFileQuery = `
                INSERT INTO job_application_files
                (file_name, file_size, file_url, created_at)
                VALUES ($1, $2, $3, NOW())
                RETURNING application_file_id
            `;
        const fileValues = [
          fileInfo.fileName,
          fileInfo.fileSize,
          fileInfo.fileUrl,
        ];
        const fileResult = await client.query(insertFileQuery, fileValues);
        const applicationFileId = fileResult.rows[0].application_file_id;

        // 3. Link in Junction Table
        const insertJunctionQuery = `
                INSERT INTO job_app_app_files
                (job_application_id, application_file_id)
                VALUES ($1, $2)
            `;
        await client.query(insertJunctionQuery, [
          jobApplicationId,
          applicationFileId,
        ]);
      }
    });

    return NextResponse.json(
      { success: true, message: "Application submitted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error submitting job application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 },
    );
  }
}
