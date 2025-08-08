// app/lib/mailer.ts
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer"; // Import Mail type for transporter
import { format } from "date-fns"; // Import date-fns for formatting expiry
import { generateSecureToken, verifySecureToken } from "./utils/generateToken"; // Import your secure token generation utility

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
  fromEmail = process.env.EMAIL_FROM,
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
  userName: string
) {
  console.log(`Verification token for ${userName}: ${token}`);

  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "support@braveworkstudio.com",
    to: toEmail,
    subject: "Verify Your Email Address for Our Services",
    html: `
      <p>Hello ${userName},</p>
      <p>Thank you for signing up for our services! Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not sign up for an account, please ignore this email.</p>
      <p>Thanks,<br/>Our Services Team</p>
    `,
    text: `Hello ${userName},\n\nThank thank you for signing up for our services! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not sign up for an account, please ignore this email.\n\nThanks,\nOur Services Team`,
  };

  try {
    const info = await currentTransporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // This gives the specific email's preview URL
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

// NEW: Function to send a confirmation email when an order is received
export async function sendOrderReceivedEmail(
  toEmail: string,
  userName: string,
  orderId: string
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
    <p><strong>Please note:</strong> No money has been charged yet. We will review your order details and send you a custom offer for confirmation.</p>
    <p>Please look out for our email with the custom offer. We're excited to get started!</p>
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${userName},\n\nThank you for placing an order with us! We have successfully received your request (Order ID: ${orderId}).\n\nPlease note: No money has been charged yet. We will review your order details and send you a custom offer for confirmation.\n\nPlease look out for our email with the custom offer. We're excited to get started!\n\nThanks,\nThe Bravework Studio Team`;

  await sendEmail({ toEmail, subject, htmlContent, textContent });
}

// NEW: Function to send a confirmation email when a payment is received
export async function sendPaymentReceivedEmail(
  toEmail: string,
  userName: string,
  orderId: string
) {
  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const subject = "Payment Received - Your Project is Underway!";
  const dashboardLink = `${process.env.NEXTAUTH_URL}/user/dashboard/orders/${orderId}`;
  const htmlContent = `
    <p>Hello ${userName},</p>
    <p>We have successfully received your payment for Order ID: <strong>${orderId}</strong>.</p>
    <p>Work will begin on your project right away! To see and track the progress of your current project, please go to your dashboard.</p>
    <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #008751; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Your Dashboard</a></p>
    <p>Thanks,<br/>The Bravework Studio Team</p>
  `;
  const textContent = `Hello ${userName},\n\nWe have successfully received your payment for Order ID: ${orderId}.\n\nWork will begin on your project right away! To see and track the progress of your current project, please go to your dashboard:\n${dashboardLink}\n\nThanks,\nThe Bravework Studio Team`;

  await sendEmail({ toEmail, subject, htmlContent, textContent });
}

// Existing function for custom offers (with a small fix)
export async function sendCustomOfferNotificationEmail(
  toEmail: string,
  userName: string,
  offerAmount: number,
  offerDescription: string,
  orderId: string,
  offerId: string, // NEW: Pass offerId to generate unique links
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
  const acceptToken = generateSecureToken(offerId, "accept", dateToNumber);
  const rejectToken = generateSecureToken(offerId, "reject", dateToNumber);
  const acceptLink = `${process.env.NEXTAUTH_URL}/api/user/custom-offers/${offerId}/accept?token=${acceptToken}`;
  const rejectLink = `${process.env.NEXTAUTH_URL}/api/user/custom-offers/${offerId}/reject?token=${rejectToken}`;
  // --- END SECURITY WARNING ---

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
    <p><strong>Offer Amount:</strong> $${offerAmount.toLocaleString()}</p>
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
  `;
  const textContent = `Hello ${userName},\n\nGreat news! We've created a new custom offer for you related to Order ID: ${orderId}.\n\nOffer Amount: $${offerAmount.toLocaleString()}\nDescription: ${offerDescription}\n\n${expiryText.replace(
    /<[^>]*>/g,
    ""
  )}\n\nPlease log in to your dashboard to view the full details and accept or reject this offer:\n${dashboardLink}\n\nAccept Offer: ${acceptLink}\nReject Offer: ${rejectLink}\n\nWe look forward to working with you!\n\nThanks,\nThe Bravework Studio Team`;
  await sendEmail({ toEmail, subject, htmlContent, textContent });
}
