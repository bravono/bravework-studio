import { NextResponse } from "next/server";
import { createZohoLead } from "@/lib/zoho";
import { contactSchema } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { createTrackingId } from "@/lib/utils/tracking";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const { error, value } = contactSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 },
      );
    }

    const { name, email, phone, subject, message, department = "General", wizardData } = value;

    // Optional Zoho integration via try-catch to prevent a site-wide crash if CRM token is stale
    try {
      const leadData = {
        Last_Name: name,
        Email: email,
        Phone: phone || "",
        Description: wizardData
          ? `Order Quote Request\nService: ${wizardData.category}\nScope: ${wizardData.scope}\nBudget: ${wizardData.budgetCurrency} ${wizardData.budgetAmount}\nTimeline: ${wizardData.timeline}\nRequirements: ${wizardData.requirements}\nFile: ${wizardData.fileUrl}\n\nUser Message: ${message}`
          : `Department: ${department}\nSubject: ${subject}\n\n${message}`,
        Lead_Source: wizardData ? "Website Wizard" : "Website Contact Form",
      };
      await createZohoLead(leadData);
    } catch (zohoError) {
      console.error("Non-fatal error creating Zoho lead:", zohoError);
    }

    // Process order if it is from the wizard
    if (wizardData) {
      // 1. Get or create user
      let user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        const parts = name.split(" ");
        user = await prisma.users.create({
          data: {
            email,
            first_name: parts[0] || "Guest",
            last_name: parts.slice(1).join(" ") || "User",
            phone: phone || null,
            is_verified: false,
          },
        });

        // Assign guest role
        const guestRole = await prisma.roles.findUnique({
          where: { role_name: "guest" }
        });
        
        if (guestRole) {
          await prisma.user_roles.create({
            data: {
              user_id: user.user_id,
              role_id: guestRole.role_id,
            }
          });
        }
      } else if (phone && !user.phone) {
        // Update phone if newly provided
        await prisma.users.update({ where: { user_id: user.user_id }, data: { phone } });
      }

      // 2. Resolve Category ID (finding by name or default to 1)
      let category = await prisma.product_categories.findFirst({
        where: {
          category_name: {
            equals: wizardData.category,
            mode: "insensitive",
          },
        },
      });

      let category_id = category ? category.category_id : 1;

      // 3. Prevent Duplicate Wizard Orders
      const orderTitle = subject ? subject.replace(/^Order For\s+/i, "") : wizardData.category;
      const existingOrder = await prisma.orders.findFirst({
        where: {
          user_id: user.user_id,
          title: orderTitle,
        },
      });

      if (existingOrder) {
        return NextResponse.json(
          { error: "You already have this order. Please check your dashboard." },
          { status: 400 },
        );
      }

      // 4. Create Order
      const newOrder = await prisma.orders.create({
        data: {
          user_id: user.user_id,
          category_id: category_id,
          title: orderTitle,
          project_description: `${wizardData.description}\nScope: ${wizardData.scope}\nRequirements: ${wizardData.requirements}`,
          budget_range: wizardData.budgetAmount,
          timeline: wizardData.timeline,
          total_expected_amount_kobo: 0,
          tracking_id: createTrackingId(category ? category.category_name : ""),
        },
      });

      if (wizardData.fileUrl) {
        const newFile = await prisma.order_files.create({
          data: {
            file_url: wizardData.fileUrl,
            file_name: wizardData.fileName || "Wizard Upload",
            order_id: newOrder.order_id
          }
        });
        await prisma.order_order_files.create({
          data: {
            order_id: newOrder.order_id,
            order_file_id: newFile.order_file_id
          }
        });
      }

      // 4. In-App Notifications
      const inAppMsg = `We've received your quote request for ${wizardData.category}. Our team will review it and get back to you shortly.`;
      await prisma.notifications.create({
        data: {
          user_id: user.user_id,
          title: "Quote Request Received",
          message: inAppMsg,
          link: `/dashboard/orders`,
        },
      });

      // Notify admins
      const admins = await prisma.user_roles.findMany({
        where: { roles: { role_name: "Admin" } },
        include: { users: true },
      });
      if (admins.length > 0) {
        await prisma.notifications.createMany({
          data: admins.map((a) => ({
            user_id: a.user_id,
            title: "New Quote Request",
            message: `New quote request received from ${name} for ${wizardData.category}.`,
          })),
        });
      }

      // 5. Send Transactional Emails
      try {
        await sendEmail({
          toEmail: email,
          subject: "We received your quote request!",
          htmlContent: `<p>Hi ${name},</p><p>Thanks for reaching out concerning your project. We have successfully recorded your details for <strong>${wizardData.category}</strong> and our team is currently reviewing them.</p><p>We will get back to you with a quote soon.</p><p>Best,<br/>Bravework Studio Team</p>`,
          textContent: `Hi ${name},\n\nThanks for reaching out concerning your project. We have successfully recorded your details for ${wizardData.category} and our team is currently reviewing them.\n\nWe will get back to you with a quote soon.\n\nBest,\nBravework Studio Team`
        });

        await sendEmail({
          toEmail: "support@braveworkstudio.com",
          subject: `New Quote Request: ${wizardData.category}`,
          htmlContent: `<p>A new quote request has been submitted by ${name} (${email}).</p><p><strong>Phone:</strong> ${phone || "N/A"}</p><p><strong>Category:</strong> ${wizardData.category}</p><p><strong>Scope:</strong> ${wizardData.scope}</p><p><strong>Budget:</strong> ${wizardData.budgetCurrency} ${wizardData.budgetAmount}</p><p>Please check the admin dashboard for more details.</p>`,
          textContent: `A new quote request has been submitted by ${name} (${email}).\nPhone: ${phone || "N/A"}\nCategory: ${wizardData.category}\nScope: ${wizardData.scope}\nBudget: ${wizardData.budgetCurrency} ${wizardData.budgetAmount}\n\nPlease check the admin dashboard for more details.`
        });
      } catch (emailError) {
        console.error("Non-fatal error sending notification elements:", emailError);
      }
    }

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
