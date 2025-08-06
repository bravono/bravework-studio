import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";

export async function GET() {
  try {
    const jobs = await queryDatabase("SELECT * FROM job_applications");
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const application = await request.formData();
    const fields = [
      "role",
      "firstName",
      "lastName",
      "email",
      "phone",
      "portfolio",
      "experience",
      "availability",
      "message",
      "file",
    ];
    const [
      role,
      firstName,
      lastName,
      email,
      phone,
      portfolio,
      experience,
      availability,
      message,
      fileRaw,
    ] = fields.map((field) => application.get(field));

    // Parse resume if it's a stringified JSON, otherwise keep as is
    let file: unknown = fileRaw;
    if (typeof fileRaw === "string") {
      try {
        file = JSON.parse(fileRaw);
      } catch {
        // If parsing fails, keep resume as the original string
        file = fileRaw;
      }
    }

    // Here you would typically save the application to your database
    await withTransaction(async (client) => {
      let appId: number;

      const applicationResult = await client.query(
        "INSERT INTO applications (role, first_name, last_name, email, phone, portfolio, experience, availability, cover_letter) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING application_id",
        [
          role,
          firstName,
          lastName,
          email,
          phone,
          portfolio,
          experience,
          availability,
          message,
        ]
      );

      appId = applicationResult.rows[0].application_id;

      if (
        file &&
        typeof file === "object" &&
        "fileName" in file &&
        "fileSize" in file &&
        "fileUrl" in file
      ) {
        await client.query(
          "INSERT INTO application_files (application_id, file_name, file_size, file_url) VALUES ($1, $2, $3, $4)",
          [appId, file.fileName, file.fileSize, file.fileUrl]
        );
      }
    });

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
