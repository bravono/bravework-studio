

import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../lib/mailer";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const LOG_FILE = path.join(process.cwd(), "sent_emails.log");

// Helper to delay execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "");
}

const SPECIAL_EMAILS = [
  "musiblinr@yahoo.com",
  "obandebie@gmail.com",
  "olubodeadedotuntemitope@gmail.com",
  "d.a.t.animation.studio@gmail.com",
  "marlaudiaz@gmail.com",
  "adeojo.dammy@gmail.com",
  "omotundekiakiode@gmail.com",
  "phinehasosebi@gmail.com",
].map((e) => e.toLowerCase());

const ROLES_TO_QUERY = [
  "storyboard-artist",
  "scriptwriter",
  "voice-actor",
  "3d-artist",
];

const SUBJECT =
  "Great news – We’d love to move forward with you on Bravework Kids!";

const getOpener = (email: string, role: string) => {
  const isSpecial = SPECIAL_EMAILS.includes(email.toLowerCase());

  if (!isSpecial) {
    return "Thank you so much for applying and for the beautiful work you shared. We really loved it!";
  }

  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes("storyboard")) {
    return "Thank you so much for applying. We especially loved the clean line work and storytelling in your storyboard samples";
  } else if (normalizedRole.includes("3d-artist")) {
    return "Thank you so much for applying. Your 3D character reel immediately stood out to us";
  } else if (normalizedRole.includes("voice-actor")) {
    return "Thank you so much for applying. The voice range and warmth in your demo was exactly what we’re looking for for the main characters";
  } else if (normalizedRole.includes("scriptwriter")) {
    return "Thank you so much for applying. The storytelling and character depth in your writing samples really resonated with our vision for Bravework Kids";
  }

  return "Thank you so much for applying and for the beautiful work you shared. We really loved it!";
};

const getEmailBody = (firstName: string, opener: string) => {
  return `Hi ${firstName},

${opener}

We wanted to be fully transparent with you right away: this is an equity/revenue-share collaboration (not a paid salaried role at this stage). We’re building a children’s animation channel together and will share profits once the channel is monetized on YouTube.

This is a genuine long-term partnership opportunity. The team is extremely passionate, the scripts and concepts are already strong, and we’re looking for talented collaborators who want to grow with us and earn meaningful equity as the channel succeeds.

If this still excites you, we’d love to hop on a quick call this week to show you the full vision, the equity split we’re offering, and answer any questions you have.

If it doesn’t align with what you’re looking for right now, no worries at all — we completely understand, and we wish you the very best!

Looking forward to hearing from you either way.

Warm regards, 
Bravework Team 

(You can reply here or book a call directly: https://calendly.com/ahbideeny/30min)`;
};

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log(`🚀 Starting batch email process. Dry run: ${isDryRun}`);

  // Load already sent emails
  const sentEmails = fs
    .readFileSync(LOG_FILE, "utf-8")
    .split("\n")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  console.log(`Found ${sentEmails.length} emails already in sent log.`);

  let applicants;
  try {
    console.log("Querying applicants from database...");
    applicants = await prisma.job_applications.findMany({
      where: {
        role: {
          in: ROLES_TO_QUERY,
          mode: "insensitive",
        },
      },
    });

    console.log(`Found ${applicants.length} total applicants matching roles.`);
  } catch (err) {
    console.error("Error during database query:", err);
    return;
  }

  let processedCount = 0;
  let skippedCount = 0;

  for (const applicant of applicants) {
    if (!applicant.email || !applicant.first_name) continue;

    const email = applicant.email.toLowerCase();

    // Skip if already sent
    if (!isDryRun && sentEmails.includes(email)) {
      skippedCount++;
      continue;
    }

    const opener = getOpener(email, applicant.role || "");
    const body = getEmailBody(applicant.first_name, opener);

    if (isDryRun) {
      console.log(
        `--- DRY RUN --- To: ${email} | Opener: ${opener.substring(0, 50)}...`,
      );
      processedCount++;
    } else {
      try {
        await sendEmail({
          toEmail: applicant.email,
          subject: SUBJECT,
          htmlContent: body.replace(/\n/g, "<br/>"),
          textContent: body,
        });

        // Log success to file immediately
        fs.appendFileSync(LOG_FILE, `${email}\n`);
        console.log(`✅ Sent and logged: ${email}`);
        processedCount++;

        // Add a 1-second delay to avoid 421 rate limiting
        await sleep(1000);
      } catch (error) {
        console.error(`❌ Failed to send to ${email}:`, error.message || error);
      }
    }
  }

  console.log(
    `🏁 Finished. Processed: ${processedCount}, Skipped (Already Sent): ${skippedCount}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
