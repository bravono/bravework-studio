// app/lib/mailer.ts
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer"; // Import Mail type for transporter

import { format } from "date-fns"; // Import date-fns for formatting expiry

import { generateSecureToken, verifySecureToken } from "./utils/generateToken"; // Import your secure token generation utility
import { KOBO_PER_NAIRA } from "@/lib/constants";
import { createNotification, getUserIdByEmail } from "./notifications";

interface SendEmailOptions {
  toEmail: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  fromEmail?: string;
}

let transporter: Mail | null = null; // Use Mail type for better type inference

// Initialize transporter once
async function initializeTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.ZUSTOM_MAIL_HOST,
      port: parseInt(process.env.ZUSTOM_MAIL_PORT || "587", 10),
      secure: process.env.ZUSTOM_MAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.ZUSTOM_MAIL_USER,
        pass: process.env.ZUSTOM_MAIL_PASS,
      },
    });
  } else {
    // Development: Use Ethereal.email for testing without real emails
    try {
      const account = await nodemailer.createTestAccount();
      console.log("--- Ethereal.email Credentials ---");
      console.log("User: " + account.user);
      console.log("Pass: " + account.pass);
      console.log(
        "--- Access your test emails at: %s ---",
        nodemailer.getTestMessageUrl(null)
      ); // Placeholder for base URL
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      // Capture the preview URL from the account object for later use if needed
      // Note: The specific preview URL for an email is returned by sendMail
    } catch (err) {
      console.error(
        "Failed to create a testing account for Ethereal.email. " + err.message
      );
      // Fallback or exit if essential for development
    }
  }
  return transporter;
}

// Call this once on server start (e.g., in an entry point or immediately here)
initializeTransporter();

// Generic function to send emails
export async function sendEmail({
  toEmail,
  subject,
  htmlContent,
  textContent,
  fromEmail = process.env.EMAIL_FROM || "support@braveworkstudio.com",
}: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });
    console.log(
      `Email sent successfully to ${toEmail} for subject: ${subject}`
    );
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error(
      `Error sending email to ${toEmail} for subject ${subject}:`,
      error
    );
    throw new Error(`Failed to send email: ${subject}`);
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  token: string,
  userName: string,
  course?: string
) {
  console.log(`Verification token for ${userName}: ${token}`);

  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;

  const subject = "Verify Your Email Address for Our Services";
  const htmlContent = `
    <p>Hello ${userName},</p>
    <p>Thank you for ${
      course ? `enrolling in course ${course}` : "signing up for our services"
    }! Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationLink}">Verify Email Address</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not sign up for an account, please ignore this email.</p>
    <p>Thanks,<br/>Our Services Team</p>
  `;
  const textContent = `Hello ${userName},\n\nThank you for ${
    course ? `enrolling in course ${course}` : "signing up for our services"
  }! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not sign up for an account, please ignore this email.\n\nThanks,\nOur Services Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });
  } catch (error) {
    console.log(error.message);
  }
}
export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetLink: string,
  expiration: number
) {
  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const subject = "Reset Your Password";
  const htmlContent = `
    <p>Hello ${userName},</p>
    <p>You have requested to reset your password</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link will expire in ${expiration} hours.</p>
    <p>If you did not initiate the password reset, please ignore this email.</p>
    <p>Thanks,<br/>Bravework Studio Services Team</p>
  `;
  const textContent = `Hello ${userName} You have requested to reset your password! Proceed by clicking the link below:\n\n${resetLink}\n\nThis link will expire in ${expiration} hours.\n\nIf you did not initiate the password reset, please ignore this email.\n\nThanks,\nBravework Studio Services Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });
  } catch (error) {
    console.log(error.message);
  }
}

// NEW: Function to send a confirmation email when an order is received
export async function sendOrderReceivedEmail(
  toEmail: string,
  userName: string,
  orderId: string,
  course?: string,
  userId?: string
) {
  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const subject = "We've Received Your Order!";
  const htmlContent = `
    <p>Hello ${userName},</p>
    <p>Thank you for placing an order with us! We have successfully received your request (Order ID: <strong>${orderId}</strong>).</p>
    ${
      course
        ? `<p>You enrolled in ${course}. Please login to your dashboard to view more details about your enrollment.</p>`
        : `<p><strong>Please note:</strong> No money has been charged yet. We will review your order details and send you a custom offer for confirmation.</p>
    <p>Please look out for our email with the custom offer. We're excited to get started!</p>`
    }
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${userName},\n\nThank you for placing an order with us! We have successfully received your request (Order ID: ${orderId}).\n\n${
    course
      ? `<p>You enrolled in ${course}. Please login to your dashboard to view your more details about your enrollment.</p>`
      : `<p><strong>Please note:</strong> No money has been charged yet. We will review your order details and send you a custom offer for confirmation.</p>
    <p>Please look out for our email with the custom offer. We're excited to get started!</p>`
  }\n\nThanks,\nThe Bravework Studio Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification
    const finalUserId = userId || (await getUserIdByEmail(toEmail));
    if (finalUserId) {
      await createNotification({
        userId: finalUserId,
        title: subject,
        message: course
          ? `Thank you for enrolling in ${course}. We have received your order (ID: ${orderId}).`
          : `We have received your order (ID: ${orderId}). We will review it and send you a custom offer soon.`,
        link: `/user/dashboard/orders/${orderId}`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// NEW: Function to send a confirmation email when a payment is received
export async function sendPaymentReceivedEmail(
  toEmail: string,
  userName: string,
  orderId: string,
  course?: string,
  userId?: string
) {
  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const subject = `Payment Received - ${
    course ? "You Have Purchase a new Course" : "Your Project is Underway!"
  }`;
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard/orders/${orderId}`;
  const htmlContent = `
    <p>Hello ${userName},</p>
    <p>We have successfully received your payment for Order ID: <strong>${orderId}</strong>.</p>
    ${
      course
        ? `Go to your dashboard to view more details about your course ${course}`
        : `<p>Work will begin on your project right away! To see and track the progress of your current project, please go to your dashboard.</p>`
    }
    <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Your Dashboard</a></p>
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${userName},\n\nWe have successfully received your payment for Order ID: ${orderId}.\n\nWork will begin on your project right away! To see and track the progress of your current project, please go to your dashboard:\n${dashboardLink}\n\nThanks,\nThe Bravework Studio Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification
    const finalUserId = userId || (await getUserIdByEmail(toEmail));
    if (finalUserId) {
      await createNotification({
        userId: finalUserId,
        title: subject,
        message: course
          ? `We have received your payment for course ${course}. (Order ID: ${orderId})`
          : `Payment received for Order ID: ${orderId}. Your project is now underway!`,
        link: `/user/dashboard/orders/${orderId}`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Existing function for custom offers (with a small fix)
export async function sendCustomOfferNotificationEmail(
  toEmail: string,
  userName: string,
  offerAmount: number,
  offerDescription: string,
  orderId: string,
  offerId: string, // NEW: Pass offerId to generate unique links
  userId: string,
  expiresAt: string | null // NEW: Pass expiry date
) {
  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }
  const subject = "New Custom Offer from Bravework Studio!";
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard/notifications?offerId=${offerId}`; // Link to their dashboard offer details page

  // Directly using offerId in URL for accept/reject is INSECURE for production.
  // Example of a more secure approach (requires backend token generation/verification):
  const dateToNumber = new Date(expiresAt).getTime() / 1000; // Convert to seconds for token generation
  const acceptToken = await generateSecureToken(
    userId,
    offerId,
    "accept",
    dateToNumber
  );
  const rejectToken = await generateSecureToken(
    userId,
    offerId,
    "reject",
    dateToNumber
  );
  const acceptLink = `${process.env.NEXTAUTH_URL}/user/dashboard/notifications?offerId=${offerId}/accept`;
  // `${process.env.NEXTAUTH_URL}/api/user/custom-offers/${offerId}/accept?token=${acceptToken}`;
  const rejectLink = `${process.env.NEXTAUTH_URL}/user/dashboard/notifications?offerId=${offerId}/reject`;
  // `${process.env.NEXTAUTH_URL}/api/user/custom-offers/${offerId}/reject?token=${rejectToken}`;

  console.log(`Accept Token: ${acceptToken} Reject Token: ${rejectToken}`);

  let expiryText = "";
  if (expiresAt) {
    try {
      const expiryDate = new Date(expiresAt);
      expiryText = `<p style="color: #e53e3e; font-weight: bold;">This offer expires on: ${format(
        expiryDate,
        "MMM dd, yyyy HH:mm:ss"
      )}.</p>`;
    } catch (e) {
      console.error("Invalid expiry date format for email:", expiresAt, e);
      expiryText = `<p style="color: #e53e3e;">This offer has an expiry date. Please check your dashboard for details.</p>`;
    }
  }

  const htmlContent = `
    <p>Hello ${userName},</p>
    <p>Great news! We've created a new custom offer for you related to Order ID: <strong>${orderId}</strong>.</p>
    <p><strong>Offer Amount:</strong> $${(
      offerAmount /
      KOBO_PER_NAIRA /
      1550
    ).toLocaleString()}</p>
    <p><strong>Description:</strong> ${offerDescription}</p>
    ${expiryText}
    <p>Please log in to your dashboard to view the full details of this offer:</p>
    <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Your Dashboard</a></p>
    <p style="margin-top: 20px;">You can also quickly respond to the offer directly:</p>
    <p>
      <a href="${acceptLink}" style="display: inline-block; padding: 10px 20px; background-color: #22c55e; color: #ffffff; text-decoration: none; border-radius: 5px; margin-right: 10px;">Accept Offer</a>
      <a href="${rejectLink}" style="display: inline-block; padding: 10px 20px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 5px;">Reject Offer</a>
    </p>
    <p style="font-size: 0.8em; color: #777;">(Note: Clicking these links will update the offer status. You may need to be logged in to your account.)</p>
    <p>We look forward to working with you!</p>
    <p>Thanks,<br/>The Bravework Studio Team</p>

    <p style="margin-top: 30px; font-size: 0.9em; color: #888;">
      Please review our 
      <a href="${
        process.env.NEXTAUTH_URL
      }/privacy-policy" style="color: #008751;">Privacy Policy</a>, 
      <a href="${
        process.env.NEXTAUTH_URL
      }/terms-of-service" style="color: #008751;">Terms of Service</a>, and 
      <a href="${
        process.env.NEXTAUTH_URL
      }/refund-policy" style="color: #008751;">Refund Policy</a>.
    </p>
  `;
  const textContent = `Hello ${userName},\n\nGreat news! We've created a new custom offer for you related to Order ID: ${orderId}.\n\nOffer Amount: $${offerAmount.toLocaleString()}\nDescription: ${offerDescription}\n\n${expiryText.replace(
    /<[^>]*>/g,
    ""
  )}\n\nPlease log in to your dashboard to view the full details and accept or reject this offer:\n${dashboardLink}\n\nAccept Offer: ${acceptLink}\nReject Offer: ${rejectLink}\n\nWe look forward to working with you!\n\nThanks,\nThe Bravework Studio Team`;
  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification
    await createNotification({
      userId: userId,
      title: subject,
      message: `You have a new custom offer for Order ID: ${orderId}. Amount: $${(
        offerAmount /
        KOBO_PER_NAIRA /
        1550
      ).toLocaleString()}`,
      link: `/user/dashboard/notifications?offerId=${offerId}`,
    });
  } catch (error) {
    console.log(error.message);
  }
}

// NEW: Function to send booking request email to owner
export async function sendBookingRequestEmail(
  toEmail: string,
  ownerName: string,
  renterName: string,
  deviceName: string,
  bookingId: string,
  startTime: string,
  endTime: string,
  totalAmount: number,
  ownerId?: string
) {
  const currentTransporter = await initializeTransporter();
  if (!currentTransporter) return;

  const subject = `New Booking Request for ${deviceName}`;
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard?tab=bookings`; // Link to My Listings

  const htmlContent = `
    <p>Hello ${ownerName},</p>
    <p>You have a new booking request from <strong>${renterName}</strong> for your device <strong>${deviceName}</strong>.</p>
    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
    <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
    <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
    <p>Please log in to your dashboard to accept or decline this request.</p>
    <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a></p>
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${ownerName},\n\nYou have a new booking request from ${renterName} for your device ${deviceName}.\n\nBooking ID: ${bookingId}\nStart Time: ${new Date(
    startTime
  ).toLocaleString()}\nEnd Time: ${new Date(
    endTime
  ).toLocaleString()}\nTotal Amount: ₦${totalAmount.toLocaleString()}\n\nPlease log in to your dashboard to accept or decline this request:\n${dashboardLink}\n\nThanks,\nThe Bravework Studio Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification to owner
    const finalOwnerId = ownerId || (await getUserIdByEmail(toEmail));
    if (finalOwnerId) {
      await createNotification({
        userId: finalOwnerId,
        title: subject,
        message: `${renterName} requested a booking for ${deviceName}.`,
        link: `/user/dashboard?tab=bookings`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// NEW: Function to send booking status update email
export async function sendBookingStatusEmail(
  toEmail: string,
  userName: string,
  deviceName: string,
  status: string,
  reason?: string,
  userId?: string
) {
  const currentTransporter = await initializeTransporter();
  if (!currentTransporter) return;

  const subject = `Booking Update: ${deviceName} - ${status.toUpperCase()}`;
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard?tab=bookings`;

  let messageBody = "";
  if (status === "accepted") {
    messageBody = `<p>Good news! Your booking request for <strong>${deviceName}</strong> has been <strong>ACCEPTED</strong>.</p>
    <p>You can now proceed with the payment to secure your booking.</p>
    <p>Your money stay with us until after you release it.</p>`;
  } else if (status === "declined") {
    messageBody = `<p>We're sorry, but your booking request for <strong>${deviceName}</strong> has been <strong>DECLINED</strong>.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}`;
  } else if (status === "cancelled") {
    messageBody = `<p>The booking for <strong>${deviceName}</strong> has been <strong>CANCELLED</strong>.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}`;
  }

  const htmlContent = `
    <p>Hello ${userName},</p>
    ${messageBody}
    <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a></p>
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${userName},\n\nBooking Update for ${deviceName}: ${status.toUpperCase()}\n\n${messageBody.replace(
    /<[^>]*>/g,
    ""
  )}\n\nGo to Dashboard: ${dashboardLink}\n\nThanks,\nThe Bravework Studio Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification to renter
    const finalUserId = userId || (await getUserIdByEmail(toEmail));
    if (finalUserId) {
      await createNotification({
        userId: finalUserId,
        title: subject,
        message: `Your booking for ${deviceName} has been ${status.toUpperCase()}.`,
        link: `/user/dashboard?tab=bookings`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// NEW: Function to notify owner when a booking is rescheduled
export async function sendBookingRescheduledEmail(
  toEmail: string,
  ownerName: string,
  renterName: string,
  deviceName: string,
  oldStartTime: string,
  oldEndTime: string,
  newStartTime: string,
  newEndTime: string,
  ownerId?: string
) {
  const currentTransporter = await initializeTransporter();
  if (!currentTransporter) return;

  const subject = `Booking Rescheduled: ${deviceName}`;
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard?tab=bookings`;

  const htmlContent = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #008751;">Booking Rescheduled</h2>
      <p>Hello ${ownerName},</p>
      <p><strong>${renterName}</strong> has updated the booking dates for your device: <strong>${deviceName}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin-top: 0;"><strong>Previous Schedule:</strong></p>
        <p style="font-size: 0.9em; color: #666;">${new Date(
          oldStartTime
        ).toLocaleString()} - ${new Date(oldEndTime).toLocaleString()}</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;" />
        
        <p><strong>New Schedule:</strong></p>
        <p style="font-size: 1.1em; color: #008751; font-weight: bold;">${new Date(
          newStartTime
        ).toLocaleString()} - ${new Date(newEndTime).toLocaleString()}</p>
      </div>

      <p>Please log in to your dashboard to review and manage this request.</p>
      <p><a href="${dashboardLink}" style="display: inline-block; padding: 12px 24px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a></p>
      <p>Thanks,<br/>The Bravework Studio Team</p>
    </div>
  `;

  const textContent = `Hello ${ownerName},\n\n${renterName} has rescheduled their booking for ${deviceName}.\n\nNew Schedule: ${new Date(
    newStartTime
  ).toLocaleString()} - ${new Date(
    newEndTime
  ).toLocaleString()}\n\nView details: ${dashboardLink}`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification to owner
    const finalOwnerId = ownerId || (await getUserIdByEmail(toEmail));
    if (finalOwnerId) {
      await createNotification({
        userId: finalOwnerId,
        title: subject,
        message: `${renterName} rescheduled their booking for ${deviceName}.`,
        link: `/user/dashboard?tab=bookings`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// NEW: Function to notify parties when funds are released
export async function sendFundsReleasedEmail(
  toEmail: string,
  userName: string,
  deviceName: string,
  role: "owner" | "renter",
  amountKobo?: number,
  userId?: string
) {
  const currentTransporter = await initializeTransporter();
  if (!currentTransporter) return;

  const subject =
    role === "owner"
      ? `Earnings Credited: ${deviceName}`
      : `Funds Released: ${deviceName}`;
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard?tab=bookings`;

  let messageBody = "";
  if (role === "owner") {
    messageBody = `<p>Good news! Your earnings for the rental of <strong>${deviceName}</strong> have been released and credited to your wallet.</p>
    <p><strong>Amount:</strong> ₦${(amountKobo / 100).toFixed(2)}</p>
    <p>Please take a moment to review the renter in your dashboard.</p>`;
  } else {
    messageBody = `<p>The funds for your rental of <strong>${deviceName}</strong> have been released to the owner.</p>
    <p>We hope you had a great experience! Please take a moment to review the device and the owner.</p>`;
  }

  const htmlContent = `
    <p>Hello ${userName},</p>
    ${messageBody}
    <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a></p>
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${userName},\n\n${subject}\n\n${messageBody.replace(
    /<[^>]*>/g,
    ""
  )}\n\nGo to Dashboard: ${dashboardLink}\n\nThanks,\nThe Bravework Studio Team`;

  try {
    await sendEmail({ toEmail, subject, htmlContent, textContent });

    // Send in-app notification
    const finalUserId = userId || (await getUserIdByEmail(toEmail));
    if (finalUserId) {
      await createNotification({
        userId: finalUserId,
        title: subject,
        message:
          role === "owner"
            ? `Earnings of ₦${(amountKobo / 100).toFixed(
                2
              )} from ${deviceName} have been credited.`
            : `Funds for ${deviceName} have been released. Please leave a review!`,
        link: dashboardLink,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
}
