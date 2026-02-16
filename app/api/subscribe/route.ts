import { NextResponse as Response } from "next/server";
import { subscriptionSchema } from "@/lib/schemas";
import { queryDatabase } from "@/lib/db";
import { getOrCreateSenderGroup, subscribeToSender } from "@/lib/sender";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { error, value } = subscriptionSchema.validate(body);
    if (error) {
      return Response.json(
        { message: error.details[0].message },
        { status: 400 },
      );
    }

    const { email, name, isActive, courseId } = value;

    console.log("Received subscription request:", {
      email,
      name,
      isActive,
      courseId,
    });

    let groupIds: string[] = [];

    // 1. Handle Course Logic if courseId is present
    if (courseId) {
      try {
        const courseRes = await queryDatabase(
          "SELECT title FROM courses WHERE course_id = $1",
          [courseId],
        );
        if (courseRes.length > 0) {
          const courseTitle = courseRes[0].title;
          const groupId = await getOrCreateSenderGroup(courseTitle);
          if (groupId) {
            groupIds.push(groupId);
          }
        }
      } catch (err) {
        console.error("Error fetching course for subscription:", err);
      }
    }

    // 2. Handle Default/Legacy Logic
    const isActiveBool = String(isActive) === "true" || isActive === true;

    // If it's a "Waitlist" request (isActive=false) and we have a course,
    // we might want a specific "Course Name - Waitlist" group?
    // The prompt says: "use the courseId in the params to look for the title and use the title as the group name."
    // It implies identifying the course interest.

    // If no course specific group was found/created, or additionally:
    if (isActiveBool) {
      const activeGroup = await getOrCreateSenderGroup(
        "Active Course Students",
      );
      if (activeGroup) groupIds.push(activeGroup);
    } else {
      // General notification/waitlist
      const waitlistGroup = await getOrCreateSenderGroup("General Waitlist");
      if (waitlistGroup) groupIds.push(waitlistGroup);
    }

    // fallback to test group if nothing else? existing code had testGroup="enJGQ4"
    if (groupIds.length === 0) {
      // Only if we really want to fallback.
      // For now, let's trust the getOrCreateSenderGroup works or we log error.
    }

    const success = await subscribeToSender(email, name, groupIds);

    if (success) {
      return Response.json({ message: "Thanks for subscribing!" });
    } else {
      return Response.json(
        { message: "Subscription failed." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in subscription handler:", error);
    return Response.json(
      { message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
