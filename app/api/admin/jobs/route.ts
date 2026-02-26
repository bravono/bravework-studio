import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";

export async function GET() {
  try {
    const jobs = await queryDatabase(`
      SELECT 
        ja.job_application_id as id,
        CONCAT(ja.first_name, ' ', ja.last_name) as "applicantName",
        ja.email as "applicantEmail",
        ja.phone,
        ja.portfolio,
        ja.experience,
        ja.availability,
        ja.role as "roleApplied",
        COALESCE(jas.status_name, 'Pending') as status,
        ja.created_at as "appliedDate",
        ja.cover_letter as "coverLetter",
        COALESCE(
          (
            SELECT json_agg(json_build_object('name', jaf.file_name, 'url', jaf.file_url))
            FROM job_application_files jaf
            JOIN job_app_app_files jaaf ON jaf.application_file_id = jaaf.application_file_id
            WHERE jaaf.job_application_id = ja.job_application_id
          ), 
          '[]'::json
        ) as files
      FROM job_applications ja
      LEFT JOIN job_app_statuses jas ON ja.status_id = jas.status_id
      ORDER BY ja.created_at DESC
    `);

    console.log("Getting Jobs", jobs);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    console.log(`Updating Job Application ID ${id} to status: ${status}`);

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields (id, status)" },
        { status: 400 },
      );
    }

    await withTransaction(async (client) => {
      // Find the status_id for the given status name (case-insensitive)
      let statusResult = await client.query(
        "SELECT status_id FROM job_app_statuses WHERE LOWER(status_name) = LOWER($1)",
        [status],
      );

      let statusId;

      if (statusResult.rows.length === 0) {
        console.log(`Status "${status}" not found. Creating it...`);
        // If status doesn't exist, create it
        const insertStatusResult = await client.query(
          "INSERT INTO job_app_statuses (status_name) VALUES ($1) RETURNING status_id",
          [status],
        );
        statusId = insertStatusResult.rows[0].status_id;
      } else {
        statusId = statusResult.rows[0].status_id;
      }

      console.log(`Found/Created status_id: ${statusId} for "${status}"`);

      // Update the application status
      const updateResult = await client.query(
        "UPDATE job_applications SET status_id = $1, updated_at = NOW() WHERE job_application_id = $2",
        [statusId, id],
      );

      console.log(`Update result: ${updateResult.rowCount} rows affected`);

      if (updateResult.rowCount === 0) {
        throw new Error(`Job application with ID ${id} not found.`);
      }
    });

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 500 },
    );
  }
}

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
        "INSERT INTO job_applications (role, first_name, last_name, email, phone, portfolio, experience, availability, cover_letter, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING job_application_id",
        [
          role,
          firstName,
          lastName,
          email,
          phone || null,
          portfolio || null,
          experience,
          availability,
          message || null,
        ],
      );

      appId = applicationResult.rows[0].job_application_id;

      if (
        file &&
        typeof file === "object" &&
        "fileName" in file &&
        "fileSize" in file &&
        "fileUrl" in file
      ) {
        const fileResult = await client.query(
          "INSERT INTO job_application_files (file_name, file_size, file_url, created_at) VALUES ($1, $2, $3, NOW()) RETURNING application_file_id",
          [file.fileName, file.fileSize, file.fileUrl],
        );
        const fileId = fileResult.rows[0].application_file_id;

        await client.query(
          "INSERT INTO job_app_app_files (job_application_id, application_file_id) VALUES ($1, $2)",
          [appId, fileId],
        );
      }
    });

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 },
    );
  }
}
