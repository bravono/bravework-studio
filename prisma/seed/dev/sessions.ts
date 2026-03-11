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

  for (const session of sessions) {
    await prisma.sessions.upsert({
      where: {
        course_id_session_number: {
          course_id: session.course_id,
          session_number: session.session_number,
        },
      },
      update: {
        session_link: session.session_link,
        session_timestamp: session.session_timestamp,
        hour_per_session: session.hour_per_session,
        recording_link: (session as any).recording_link || null,
      },
      create: session,
    });
  }
}
