import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer'; // Import Mail type for transporter

let transporter: Mail | null = null; // Use Mail type for better type inference

// Initialize transporter once
async function initializeTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.NODE_ENV === 'production') {
    // Production: Use a dedicated email service (e.g., SendGrid, Mailgun)
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net', // Or your email service's SMTP host
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: 'apikey', // For SendGrid
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Development: Use Ethereal.email for testing without real emails
    try {
      const account = await nodemailer.createTestAccount();
      console.log('--- Ethereal.email Credentials ---');
      console.log('User: ' + account.user);
      console.log('Pass: ' + account.pass);
      console.log('--- Access your test emails at: %s ---', nodemailer.getTestMessageUrl(null)); // Placeholder for base URL
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
      console.error('Failed to create a testing account for Ethereal.email. ' + err.message);
      // Fallback or exit if essential for development
    }
  }
  return transporter;
}

// Call this once on server start (e.g., in an entry point or immediately here)
initializeTransporter();


export async function sendVerificationEmail(toEmail: string, token: string, userName: string) {
  const currentTransporter = await initializeTransporter(); // Ensure transporter is ready
  if (!currentTransporter) {
    console.error("Email transporter not initialized! Cannot send email.");
    return;
  }

  const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@your-services.com',
    to: toEmail,
    subject: 'Verify Your Email Address for Our Services',
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
    console.log('Email sent: %s', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // This gives the specific email's preview URL
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}