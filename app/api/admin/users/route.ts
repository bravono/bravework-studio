// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function GET(request: Request) {
  const guardResponse = await verifyAdmin(request);
  if (guardResponse) return guardResponse;

  const { searchParams } = new URL(request.url);
  const pendingOnly = searchParams.get("pendingVerification") === "true";

  try {
    const allUsers = await queryDatabase(
      `
      SELECT
      u.user_id AS id,
      u.user_id,
      (u.first_name || ' ' || u.last_name) AS "fullName",
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      u.email,
      u.phone,
      u.company_name AS "companyName",
      u.bio,
      u.profile_picture_url AS "profilePictureUrl",
      u.email_verified AS "emailVerified",
      u.is_verified AS "isVerified",
      u.two_factor_enabled AS "twoFactorEnabled",
      u.referral_code AS "referralCode",
      u.hear_about_us AS "hearAboutUs",
      u.created_at AS "createdAt",
      u.updated_at AS "updatedAt",
      u.verification_submitted_at AS "verificationSubmittedAt",
      u.id_type AS "idType",
      u.id_card_front_url AS "idCardFrontUrl",
      u.id_card_back_url AS "idCardBackUrl",
      u.selfie_with_id_url AS "selfieWithIdUrl",
      COALESCE(
        json_agg(
        json_build_object(
          'roleName', r.role_name
        )
        ) FILTER (WHERE ur.user_id IS NOT NULL),
        '[]'
      ) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      ${pendingOnly ? "WHERE u.verification_submitted_at IS NOT NULL AND u.is_verified = FALSE" : ""}
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone, u.company_name, u.bio, u.profile_picture_url, u.email_verified, u.is_verified, u.two_factor_enabled, u.referral_code, u.hear_about_us, u.created_at, u.updated_at, u.verification_submitted_at, u.id_type, u.id_card_front_url, u.id_card_back_url, u.selfie_with_id_url
      ORDER BY u.created_at DESC
      `,
    );
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
