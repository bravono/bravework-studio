import { prisma } from "../client";

export async function seedSessions() {
  const medicalViz = await prisma.courses.findUnique({
    where: { title: "Medical 3D Visualization in Just 2 Hours" },
  });
  const techForMed = await prisma.courses.findUnique({
    where: { title: "3D Technology for Medical Professionals" },
  });
  const kidsTraining = await prisma.courses.findUnique({
    where: { title: "3D Animation Training for Kids" },
  });

  if (!medicalViz || !techForMed || !kidsTraining) {
    console.warn("Skipping sessions seed: One or more courses not found");
    return;
  }

  const sessions = [
    {
      course_id: medicalViz.course_id,
      session_number: 2,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T19:00:00Z"),
      hour_per_session: 2,
    },
    {
      course_id: medicalViz.course_id,
      session_number: 1,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T09:00:00Z"),
      hour_per_session: 2,
    },
    {
      course_id: kidsTraining.course_id,
      session_number: 2,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T19:00:00Z"),
      hour_per_session: 2,
    },
    {
      course_id: kidsTraining.course_id,
      session_number: 1,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T09:00:00Z"),
      hour_per_session: 2,
    },
    {
      course_id: techForMed.course_id,
      session_number: 2,
      session_link: null,
      session_timestamp: new Date("2025-11-01T15:00:00Z"),
      hour_per_session: 3,
    },
    {
      course_id: techForMed.course_id,
      session_number: 1,
      session_link: null,
      session_timestamp: new Date("2025-11-01T09:00:00Z"),
      hour_per_session: 3,
      recording_link: "https://youtu.be/kBd88zTFvCo?si=OWlJguKxKS8H3DJ0",
    },
  ];

  for (const sessionData of sessions) {
    // Since we don't have a unique key anymore, we look for an existing record
    // that matches course, number, AND time.
    const existing = await prisma.sessions.findFirst({
      where: {
        course_id: sessionData.course_id,
        session_number: sessionData.session_number,
        session_timestamp: sessionData.session_timestamp,
      },
    });

    if (existing) {
      await prisma.sessions.update({
        where: { session_id: existing.session_id },
        data: {
          session_link: sessionData.session_link,
          hour_per_session: sessionData.hour_per_session,
          recording_link: (sessionData as any).recording_link || null,
        },
      });
    } else {
      await prisma.sessions.create({
        data: sessionData,
      });
    }
  }
}
