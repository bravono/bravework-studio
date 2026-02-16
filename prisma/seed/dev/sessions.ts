import { prisma } from "../client";

export async function seedSessions() {
  const sessions = [
    {
      session_id: 4,
      course_id: 3,
      session_number: 2,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T19:00:00Z"),
      hour_per_session: 2,
      recording_link: null,
      session_label: null,
    },
    {
      session_id: 3,
      course_id: 3,
      session_number: 1,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T09:00:00Z"),
      hour_per_session: 2,
      recording_link: null,
      session_label: null,
    },
    {
      session_id: 8,
      course_id: 1,
      session_number: 2,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T19:00:00Z"),
      hour_per_session: 2,
      recording_link: null,
      session_label: null,
    },
    {
      session_id: 7,
      course_id: 1,
      session_number: 1,
      session_link:
        "https://moderated.jitsi.net/1164ce13cd2747929a5700a9aae34fb10309fe92eb3a4837b825863f043093ce",
      session_timestamp: new Date("2025-09-26T09:00:00Z"),
      hour_per_session: 2,
      recording_link: null,
      session_label: null,
    },
    {
      session_id: 6,
      course_id: 4,
      session_number: 2,
      session_link: null,
      session_timestamp: new Date("2025-11-01T15:00:00Z"),
      hour_per_session: 3,
      recording_link: null,
      session_label: null,
    },
    {
      session_id: 5,
      course_id: 4,
      session_number: 1,
      session_link: null,
      session_timestamp: new Date("2025-11-01T09:00:00Z"),
      hour_per_session: 3,
      recording_link: "https://youtu.be/kBd88zTFvCo?si=OWlJguKxKS8H3DJ0",
      session_label: null,
    },
  ];

  for (const session of sessions) {
    await prisma.sessions.upsert({
      where: { session_id: session.session_id },
      update: {},
      create: session,
    });
  }
}